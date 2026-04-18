import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateStatementOrganizationDTO } from './dtos/create';
import { validate } from 'class-validator';
import { StatementOrganizationEntity } from './entities/statement_organization.entity';
import { ReturnStatementOrganizationDTO } from './dtos/return';
import { format } from 'date-fns';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';
// import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class StatementOrganizationService {
  constructor(
    @InjectRepository(StatementOrganizationEntity)
    private readonly statementOrganizationRepository: Repository<StatementOrganizationEntity>,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
    // private readonly transactionService: TransactionService,
  ) {}

  async create(
    account_id: string,
    createStatementOrganizationDTO: CreateStatementOrganizationDTO,
  ): Promise<StatementOrganizationEntity> {
    // await this.transactionService.findById(
    //   account_id,
    //   createStatementOrganizationDTO.transaction_id,
    // );
    const dto = Object.assign(
      new CreateStatementOrganizationDTO(),
      createStatementOrganizationDTO,
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
    const statement = this.statementOrganizationRepository.create({
      ...createStatementOrganizationDTO,
    });
    const savedStatement =
      await this.statementOrganizationRepository.save(statement);

    // Log de auditoria
    await this.auditService.log({
      table_name: 'erp_statement_organization',
      record_id: savedStatement.id,
      operation: 'INSERT',
      new_values: savedStatement,
      account_id: account_id,
      ...(this.request as any).auditData,
    });

    return savedStatement;
  }

  async findAll(
    account_id?: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    data: StatementOrganizationEntity[];
    total: number;
  }> {
    const statements = await this.statementOrganizationRepository.find({
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

    const countStatements = await this.statementOrganizationRepository.count({
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

  async sumStatementsByTransactionId(
    account_id: string,
    transaction_id: string,
  ): Promise<number> {
    const total = await this.statementOrganizationRepository.sum('amount', {
      account_id: account_id,
      transaction: {
        payment_status: 1,
        id: transaction_id,
      },
    });
    return total || 0;
  }

  async sumByStatementType(
    account_id: string,
    statement_type: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<number> {
    let where: FindOptionsWhere<StatementOrganizationEntity> = {
      account_id: account_id,
      transaction: {
        payment_status: 1,
      },
      statement_type: {
        name: statement_type,
      },
      event_id: event_id ? event_id : undefined,
    };
    if (start_date && end_date) {
      where.created_at = Between(start_date, end_date);
    }
    const total = await this.statementOrganizationRepository.sum(
      'amount',
      where,
    );
    return total || 0;
  }

  async sumStatementsAll(
    account_id: string,
    start_date?: Date,
    end_date?: Date,
    event_id?: string,
    bank_id?: string,
  ): Promise<number> {
    const total = await this.statementOrganizationRepository.sum('amount', {
      account_id: account_id,
      // created_at: Between(start_date || new Date(0), end_date || new Date()),
      transaction: {
        payment_status: 1,
        event_id: event_id ? event_id : undefined,
        bank_id: bank_id ? bank_id : undefined,
      },
    });
    return total || 0;
  }

  async totalNetByTransaction(
    account_id: string,
    event_id?: string,
    bank_id?: string,
    limit?: number,
    offset?: number,
    payment_id?: string,
    statement_type_names?: string[] | string,
    start_date?: string,
    end_date?: string,
    isExport?: boolean,
  ): Promise<{
    data: { transaction_id: string; total: number }[];
    total: number;
  }> {
    let statements;
    if (!statement_type_names) {
      let where: FindOptionsWhere<StatementOrganizationEntity> = {
        account_id: account_id,
        transaction: {
          payment_status: 1,
          payment_id: payment_id ? payment_id : undefined,
          bank_id: bank_id ? bank_id : undefined,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      if (event_id) {
        where.event_id = event_id;
      }
      statements = await this.statementOrganizationRepository.find({
        where,
        relations: ['transaction', 'event', 'statement_type'],
        take: isExport === true ? undefined : limit,
        skip: offset,
        order: {
          created_at: 'DESC',
        },
      });
    } else {
      let where: FindOptionsWhere<StatementOrganizationEntity> = {
        statement_type: {
          name: Array.isArray(statement_type_names)
            ? In(statement_type_names as string[])
            : String(statement_type_names),
        },
        account_id: account_id,
        transaction: {
          payment_status: 1,
          payment_id: payment_id ? payment_id : undefined,
          bank_id: bank_id ? bank_id : undefined,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      if (event_id) {
        where.event_id = event_id;
      }
      statements = await this.statementOrganizationRepository.find({
        where,
        relations: ['transaction', 'event', 'statement_type'],
        take: isExport === true ? undefined : limit,
        skip: offset,
        order: {
          created_at: 'DESC',
        },
      });
    }

    let countStatements;

    if (!statement_type_names) {
      let where: FindOptionsWhere<StatementOrganizationEntity> = {
        account_id: account_id,
        transaction: {
          payment_status: 1,
          payment_id: payment_id ? payment_id : undefined,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      if (event_id) {
        where.event_id = event_id;
      }
      countStatements = await this.statementOrganizationRepository.count({
        where,
      });
    } else {
      let where: FindOptionsWhere<StatementOrganizationEntity> = {
        statement_type: {
          name: Array.isArray(statement_type_names)
            ? In(statement_type_names as string[])
            : String(statement_type_names),
        },
        account_id: account_id,
        transaction: {
          payment_status: 1,
          payment_id: payment_id ? payment_id : undefined,
        },
      };
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date), new Date(end_date));
      }
      if (event_id) {
        where.event_id = event_id;
      }
      countStatements = await this.statementOrganizationRepository.count({
        where,
      });
    }

    if (isExport == true) {
      return {
        data: statements.map((statement: ReturnStatementOrganizationDTO) => ({
          statement_type: statement.type,
          statement_type_name: statement.statement_type?.name,
          statement_created_at: statement.transaction?.created_at,
          transaction_id: statement.transaction_id,
          transaction_payment_id: statement.transaction?.payment_id,
          // transaction_date: statement.transaction_date,
          transaction_payment_method: statement.transaction?.payment_method,
          transaction_event_name: statement.event?.name,
          total: Number(statement.amount),
        })),
        total: countStatements,
      };
    } else {
      return {
        data: Object.values(
          statements.reduce(
            (acc, statement: ReturnStatementOrganizationDTO) => {
              const date = format(
                new Date(statement.transaction?.created_at || '1970-01-01'),
                'yyyy-MM-dd',
              );

              if (!acc[date]) {
                acc[date] = {
                  date,
                  transactions: [],
                  balanceDay: 0,
                };
              }

              const amount = Number(statement.amount);
              if (statement.type === 'income') {
                acc[date].balanceDay += amount;
              }

              acc[date].transactions.push({
                statement_type: statement.type,
                statement_type_name: statement.statement_type?.name,
                statement_created_at: statement.transaction?.created_at,
                transaction_id: statement.transaction_id,
                transaction_payment_id: statement.transaction?.payment_id,
                transaction_payment_method:
                  statement.transaction?.payment_method,
                transaction_event_name: statement.event?.name,
                total: Number(statement.amount),
              });

              return acc;
            },
            {} as Record<
              string,
              { date: string; transactions: any[]; balanceDay: number }
            >,
          ),
        ),
        total: countStatements,
      };
    }
  }

  async totalRevenue(
    account_id: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<number | null> {
    let where: FindOptionsWhere<StatementOrganizationEntity> = {
      account_id: account_id,
      transaction: {
        payment_status: 1,
        event_id: event_id ? event_id : undefined,
      },
    };

    if (start_date && end_date) {
      where.created_at = Between(start_date, end_date);
    }

    const total = await this.statementOrganizationRepository.sum(
      'amount',
      where,
    );
    return total;
  }

  async metricsByEvent(
    account_id: string,
    limit?: number,
    offset?: number,
    order_by?: 'revenue' | 'income' | 'expense' | 'margin',
    event_name?: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<{
    data: {
      event_id: string;
      event_name: string;
      start_date: Date;
      end_date: Date;
      total_income: number;
      total_expense: number;
      total_revenue: number;
      total_margin: number;
    }[];
    totals: {
      count: number;
      income: number;
      expense: number;
      revenue: number;
    };
  }> {
    const baseQuery = this.statementOrganizationRepository
      .createQueryBuilder('fso')
      .select('e.id', 'event_id')
      .addSelect('e.name', 'event_name')
      .addSelect('e.start_date', 'start_date')
      .addSelect('e.end_date', 'end_date')
      .addSelect(
        `SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END)`,
        'total_income',
      )
      .addSelect(
        `SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END)`,
        'total_expense',
      )
      .addSelect(
        `
      SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) +
      SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END)
    `,
        'total_revenue',
      )
      .addSelect(
        `
        (SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) /
         (SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) -
          SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END))) * 100
        `,
        'total_margin',
      )
      .innerJoin('fso.event', 'e')
      .innerJoin('fso.transaction', 'ft')
      .where('e.account_id = :account_id', { account_id })
      .andWhere('ft.payment_status = :status', { status: 1 })
      .andWhere('e.name ILIKE :event_name', {
        event_name: event_name ? `%${event_name}%` : '%',
      })
      .groupBy('e.id')
      .addGroupBy('e.name')
      .addGroupBy('e.start_date');

    if (event_id) {
      baseQuery.andWhere('e.id = :event_id', { event_id });
    }

    if (start_date && end_date) {
      baseQuery.andWhere('fso.created_at BETWEEN :start_date AND :end_date', {
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      });
    }

    if (order_by) {
      switch (order_by) {
        case 'revenue':
          baseQuery.orderBy('total_revenue', 'DESC');
          break;
        case 'margin':
          baseQuery.orderBy('total_margin', 'DESC');
          break;
        case 'income':
          baseQuery.orderBy('total_income', 'DESC');
          break;
        case 'expense':
          baseQuery.orderBy('total_expense', 'ASC');
          break;
        default:
          baseQuery.orderBy('e.start_date', 'DESC');
      }
    } else {
      baseQuery.orderBy('e.start_date', 'DESC');
    }

    const metrics = await baseQuery.limit(limit).offset(offset).getRawMany();

    const totalCount = await this.statementOrganizationRepository
      .createQueryBuilder('fso')
      .select('COUNT(DISTINCT e.id)', 'total')
      .innerJoin('fso.event', 'e')
      .innerJoin('fso.transaction', 'ft')
      .where('e.account_id = :account_id', { account_id })
      .andWhere('ft.payment_status = :status', { status: 1 })
      .andWhere('e.name ILIKE :event_name', {
        event_name: event_name ? `%${event_name}%` : '%',
      });

    if (event_id) {
      totalCount.andWhere('e.id = :event_id', { event_id });
    }

    if (start_date && end_date) {
      totalCount.andWhere('fso.created_at BETWEEN :start_date AND :end_date', {
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      });
    }

    const totalIncome = await this.statementOrganizationRepository.sum(
      'amount',
      {
        account_id: account_id,
        type: 'income',
        created_at: Between(start_date || new Date(0), end_date || new Date()),
        transaction: {
          payment_status: 1,
          event_id: event_id ? event_id : undefined,
        },
      },
    );

    const totalExpense = await this.statementOrganizationRepository.sum(
      'amount',
      {
        account_id: account_id,
        type: 'expense',
        created_at: Between(start_date || new Date(0), end_date || new Date()),
        transaction: {
          payment_status: 1,
          event_id: event_id ? event_id : undefined,
        },
      },
    );
    100;

    const totalRevenue = await this.statementOrganizationRepository.sum(
      'amount',
      {
        account_id: account_id,
        created_at: Between(start_date || new Date(0), end_date || new Date()),
        transaction: {
          payment_status: 1,
          event_id: event_id ? event_id : undefined,
        },
      },
    );

    return {
      data: metrics.map((metric) => ({
        event_id: metric.event_id,
        event_name: metric.event_name,
        start_date: new Date(metric.start_date),
        end_date: new Date(metric.end_date),
        total_income: Number(metric.total_income),
        total_expense: Number(metric.total_expense),
        total_revenue: Number(metric.total_revenue),
        total_margin: Number(metric.total_margin),
      })),
      totals: {
        count: Number((await totalCount.getRawOne()).total),
        income: totalIncome || 0,
        expense: totalExpense || 0,
        revenue: totalRevenue || 0,
      },
    };
  }
}
