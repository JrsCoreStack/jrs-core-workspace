import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateStatementProducerDTO } from './dtos/create';
import { validate } from 'class-validator';
import { StatementProducerEntity } from './entities/statement_producer.entity';

@Injectable()
export class StatementProducerService {
  constructor(
    @InjectRepository(StatementProducerEntity)
    private readonly statementProducerRepository: Repository<StatementProducerEntity>,
  ) {}

  async create(
    account_id: string,
    createStatementProducerDTO: CreateStatementProducerDTO,
  ): Promise<StatementProducerEntity> {
    // await this.transactionService.findById(
    //   account_id,
    //   createStatementProducerDTO.transaction_id,
    // );
    const dto = Object.assign(
      new CreateStatementProducerDTO(),
      createStatementProducerDTO,
    );
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const statement = this.statementProducerRepository.create({
      ...createStatementProducerDTO,
    });
    return this.statementProducerRepository.save(statement);
  }

  async findAll(
    account_id?: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    data: StatementProducerEntity[];
    total: number;
  }> {
    const statements = await this.statementProducerRepository.find({
      where: {
        transaction: {
          event: {
            account_id: account_id,
          },
        },
      },
      relations: [
        'transaction',
        'transaction.event',
        'transaction.event.account',
      ],
      take: limit,
      skip: offset,
      order: {
        created_at: 'DESC',
      },
    });

    const countStatements = await this.statementProducerRepository.count({
      where: {
        transaction: {
          event: {
            account_id: account_id,
          },
        },
      },
    });

    return {
      data: statements,
      total: countStatements,
    };
  }

  async totalRevenue(
    account_id: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<number | null> {
    let where: FindOptionsWhere<StatementProducerEntity> = {
      account_id: account_id,
      transaction: {
        payment_status: 1,
        event_id: event_id ? event_id : undefined,
      },
    };

    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    }

    const total = await this.statementProducerRepository.sum('amount', where);
    return total;
  }

  async totalNetByTransaction(
    account_id: string,
    limit?: number,
    offset?: number,
    statement_type_names?: string[] | string,
    start_date?: string,
    end_date?: string,
  ): Promise<{
    data: { transaction_id: string; total: number }[];
    total: number;
  }> {
    let statements;
    if (!statement_type_names) {
      statements = await this.statementProducerRepository
        .createQueryBuilder('statement')
        .innerJoin('statement.transaction', 'transaction')
        .innerJoin('transaction.event', 'event')
        .innerJoin('statement.statement_type', 'statement_type')
        .select('statement.transaction_id', 'transaction_id')
        .addSelect('SUM(statement.amount)', 'statement_total')
        .addSelect('transaction.total', 'transaction_total')
        .addSelect('transaction.payment_method', 'transaction_payment_method')
        .addSelect('transaction.created_at', 'transaction_date')
        .addSelect('event.name', 'transaction_event_name')
        .where('statement.account_id = :account_id', { account_id })
        .andWhere('statement_type.name not in (:...statement_type_names)', {
          statement_type_names: ['customer_fee', 'customer_spread'],
        })
        .andWhere('transaction.payment_status = 1')
        .andWhere('transaction.created_at BETWEEN :start_date AND :end_date', {
          start_date: (start_date
            ? new Date(start_date)
            : new Date('1970-01-01')
          ).toISOString(),
          end_date: (end_date ? new Date(end_date) : new Date()).toISOString(),
        })
        .groupBy('statement.transaction_id')
        .addGroupBy('transaction.total')
        .addGroupBy('transaction.payment_method')
        .addGroupBy('transaction.created_at')
        .addGroupBy('event.name')
        .limit(limit)
        .offset(offset)
        .getRawMany();
    } else {
      let where: FindOptionsWhere<StatementProducerEntity> = {
        statement_type: {
          name: Array.isArray(statement_type_names)
            ? In(statement_type_names as string[])
            : String(statement_type_names),
        },
        account_id: account_id,
        transaction: {
          payment_status: 1,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      statements = await this.statementProducerRepository.find({
        where,
        relations: ['transaction', 'event', 'statement_type'],
        take: limit,
        skip: offset,
        order: {
          created_at: 'ASC',
        },
      });
    }

    let countStatements;

    if (!statement_type_names) {
      countStatements = await this.statementProducerRepository
        .createQueryBuilder('statement')
        .innerJoin('statement.transaction', 'transaction')
        .where('statement.account_id = :account_id', { account_id })
        .andWhere('transaction.payment_status = 1')
        .andWhere('transaction.created_at BETWEEN :start_date AND :end_date', {
          start_date: (start_date
            ? new Date(start_date)
            : new Date('1970-01-01')
          ).toISOString(),
          end_date: (end_date ? new Date(end_date) : new Date()).toISOString(),
        })
        .select('COUNT(DISTINCT statement.transaction_id)', 'count')
        .getRawOne();
    } else {
      let where: FindOptionsWhere<StatementProducerEntity> = {
        statement_type: {
          name: Array.isArray(statement_type_names)
            ? In(statement_type_names as string[])
            : String(statement_type_names),
        },
        account_id: account_id,
        transaction: {
          payment_status: 1,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      countStatements = await this.statementProducerRepository.count({
        where,
      });
    }

    return {
      data: statements.map((statement) => ({
        statement_type: !statement_type_names
          ? 'income'
          : String(statement.statement_type.name).includes('customer')
            ? 'income'
            : 'expense',
        statement_type_name: !statement_type_names
          ? 'receipt'
          : statement.statement_type.name,
        transaction_id: statement.transaction_id,
        transaction_date: statement.transaction_date,
        transaction_payment_method: !statement_type_names
          ? statement.transaction_payment_method
          : statement.transaction.payment_method,
        transaction_event_name: !statement_type_names
          ? statement.transaction_event_name
          : statement.event.name,
        total: !statement_type_names
          ? parseFloat(
              (
                Number(statement.transaction_total) -
                Number(statement.statement_total)
              ).toFixed(2),
            )
          : Number(statement.amount),
      })),
      total: !statement_type_names
        ? Number(countStatements.count)
        : countStatements,
    };
  }
}
