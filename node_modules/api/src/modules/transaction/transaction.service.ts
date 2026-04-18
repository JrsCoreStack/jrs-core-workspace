import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, MoreThan, Repository } from 'typeorm';
import { CreateTransactionDTO } from './dtos/create';
import { validate } from 'class-validator';
import { TransactionEntity } from './entities/transaction.entity';
import { EventService } from '../event/event.service';
import { StatementOrganizationService } from '../statement_organization/statement_organization.service';
import { StatementProducerService } from '../statement_producer/statement_producer.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly statementOrganizationService: StatementOrganizationService,
    private readonly statementProducerService: StatementProducerService,
    private readonly eventService: EventService,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(
    createTransactionDTO: CreateTransactionDTO,
  ): Promise<TransactionEntity> {
    await this.eventService.findById(createTransactionDTO.event_id);
    const dto = Object.assign(new CreateTransactionDTO(), createTransactionDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const transaction = this.transactionRepository.create(createTransactionDTO);
    const savedTransaction = await this.transactionRepository.save(transaction);

    // Log de auditoria
    await this.auditService.log({
      table_name: 'erp_transaction',
      record_id: savedTransaction.id,
      operation: 'INSERT',
      new_values: savedTransaction,
      ...(this.request as any).auditData,
    });

    return savedTransaction;
  }

  async findAll(
    account_id?: string,
    event_id?: string,
    bank_id?: string,
    limit?: number,
    offset?: number,
    payment_id?: string,
    payment_status?: number[] | number,
    start_date?: string,
    end_date?: string,
    payment_method?: string,
  ): Promise<{
    data: TransactionEntity[];
    total: number;
  }> {
    const where: FindOptionsWhere<TransactionEntity> = {
      event: {
        account_id: account_id,
      },
    };
    if (payment_id) {
      where.payment_id = payment_id;
    }
    if (bank_id) {
      where.bank_id = bank_id;
    }
    if (event_id) {
      where.event = {
        id: event_id,
      };
    }
    if (payment_method) {
      where.payment_method = Array.isArray(payment_method)
        ? In(payment_method)
        : payment_method;
    }
    if (payment_status !== undefined && payment_status !== null) {
      where.payment_status = Array.isArray(payment_status)
        ? In(payment_status as number[])
        : Number(payment_status);
    }
    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    }
    const transactions = await this.transactionRepository.find({
      where,
      relations: ['event', 'event.account', 'bank'],
      take: limit,
      skip: offset,
      order: {
        created_at: 'DESC',
      },
    });

    const countTransactions = await this.transactionRepository.count({
      where,
    });

    return {
      data: transactions,
      total: countTransactions,
    };
  }

  async findTotalTransactions(
    account_id: string,
    event_id?: string,
    bank_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<{
    gross_total: number;
    net_total: number;
    bank_taxes_total: number;
    bank_spread_total: number;
    product_value_total: number;
    customer_taxes_total: number;
    customer_spread_total: number;
    negotiated_taxes_producer_total?: number;
    negotiated_taxes_pixps_total?: number;
    quantity: number;
  }> {
    let where: FindOptionsWhere<TransactionEntity> = {
      event: {
        account_id: account_id,
        id: event_id,
      },
      payment_status: 1, // Pega somente transações aprovadas
    };

    if (bank_id) {
      where.bank_id = bank_id;
    }

    if (start_date && end_date) {
      where.created_at = Between(start_date, end_date);
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: [
        'event',
        'statements_organization',
        'statements_organization.statement_type',
        'statements_producer',
        'statements_producer.statement_type',
      ],
    });

    const totalGrossValue = transactions.reduce((total, transaction) => {
      const transactionTotal = Number(transaction.total) || 0;
      return total + transactionTotal;
    }, 0);

    const totalNetValue =
      await this.statementOrganizationService.sumStatementsAll(
        account_id,
        start_date,
        end_date,
        event_id,
        bank_id,
      );

    let expensesStatementsTotal = 0;
    let incomeStatementsTotal = 0;
    let bankTaxesStatements = 0;
    let bankSpreadStatements = 0;
    let productValueStatements = 0;
    let customerTaxesStatements = 0;
    let customerSpreadStatements = 0;
    let negotiatedTaxesProducerTotal = 0;
    let negotiatedTaxesPixpsTotal = 0;

    transactions.map((transaction) => {
      if (transaction.statements_organization.length > 0) {
        transaction.statements_organization.map((statement) => {
          if (statement.type === 'expense') {
            const statementValue = Number(statement.amount) || 0;
            expensesStatementsTotal += statementValue;
            if (statement.statement_type.name === 'bank_fee') {
              bankTaxesStatements += statementValue;
            } else if (statement.statement_type.name === 'bank_spread') {
              bankSpreadStatements += statementValue;
            }
          } else if (statement.type === 'income') {
            const statementValue = Number(statement.amount) || 0;
            incomeStatementsTotal += statementValue;
            if (statement.statement_type.name === 'customer_fee') {
              customerTaxesStatements += statementValue;
            } else if (statement.statement_type.name === 'customer_spread') {
              customerSpreadStatements += statementValue;
            } else if (
              statement.statement_type.name === 'fee_negotiated_customer'
            ) {
              negotiatedTaxesProducerTotal += statementValue;
            } else if (
              statement.statement_type.name === 'fee_negotiated_pixps'
            ) {
              negotiatedTaxesPixpsTotal += statementValue;
            }
          }
        });
      }
      if (transaction.statements_producer.length > 0) {
        transaction.statements_producer.map((statement) => {
          if (statement.type === 'income') {
            const statementValue = Number(statement.amount) || 0;
            incomeStatementsTotal += statementValue;
            if (statement.statement_type.name === 'product_value') {
              productValueStatements += statementValue;
            }
          }
        });
      }
    });

    return {
      gross_total: Number(totalGrossValue.toFixed(2)),
      net_total: Number(totalNetValue),
      bank_taxes_total: Number(bankTaxesStatements.toFixed(2)),
      bank_spread_total: Number(bankSpreadStatements.toFixed(2)),
      product_value_total: Number(productValueStatements.toFixed(2)),
      customer_taxes_total: Number(customerTaxesStatements.toFixed(2)),
      customer_spread_total: Number(customerSpreadStatements.toFixed(2)),
      negotiated_taxes_producer_total: Number(
        negotiatedTaxesProducerTotal.toFixed(2),
      ),
      negotiated_taxes_pixps_total: Number(
        negotiatedTaxesPixpsTotal.toFixed(2),
      ),
      quantity: transactions.length,
    };
  }

  async findById(
    account_id: string,
    id: string,
  ): Promise<{
    data: TransactionEntity;
    bank_fee: number;
    bank_spread: number;
    product_value: number;
    fee_negotiated_customer: number;
    fee_negotiated_pixps: number;
    total_net: number;
  }> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: id,
        event: {
          account_id: account_id,
        },
      },
      relations: [
        'statements_organization',
        'statements_producer',
        'event',
        'bank',
        'statements_organization.statement_type',
        'statements_producer.statement_type',
      ],
    });

    if (!transaction) {
      throw new BadRequestException(`Transação não encontrada.`);
    }

    const sumStatements =
      await this.statementOrganizationService.sumStatementsByTransactionId(
        account_id,
        id,
      );

    return {
      data: transaction,
      bank_fee: transaction.statements_organization.filter(
        (item) => item.statement_type.name === 'bank_fee',
      )[0]?.amount,
      bank_spread: transaction.statements_organization.filter(
        (item) => item.statement_type.name === 'bank_spread',
      )[0]?.amount,
      product_value: transaction.statements_producer.filter(
        (item) => item.statement_type.name === 'product_value',
      )[0]?.amount,
      fee_negotiated_customer: transaction.statements_organization.filter(
        (item) => item.statement_type.name === 'fee_negotiated_customer',
      )[0]?.amount,
      fee_negotiated_pixps: transaction.statements_organization.filter(
        (item) => item.statement_type.name === 'fee_negotiated_pixps',
      )[0]?.amount,
      total_net: sumStatements,
    };
  }

  async findStatusSales(
    account_id: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<{
    [key: string]: {
      total_sales: number;
      total_sales_percentage: number;
    };
  }> {
    const baseWhere: FindOptionsWhere<TransactionEntity> = {
      event: {
        account_id: account_id,
        id: event_id ? event_id : undefined,
      },
    };

    if (start_date && end_date) {
      baseWhere.created_at = Between(start_date, end_date);
    }

    const [
      totalTransactions,
      totalSalesApproved,
      totalSalesRejected,
      totalSalesPending,
      totalSalesExpired,
    ] = await Promise.all([
      this.transactionRepository.count({ where: baseWhere }),
      this.transactionRepository.count({
        where: { ...baseWhere, payment_status: 1 },
      }),
      this.transactionRepository.count({
        where: { ...baseWhere, payment_status: 2 },
      }),
      this.transactionRepository.count({
        where: { ...baseWhere, payment_status: 3 },
      }),
      this.transactionRepository.count({
        where: { ...baseWhere, payment_status: 6 },
      }),
    ]);

    const calculatePercentage = (value: number, total: number): number =>
      total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;

    const result: {
      [key: string]: {
        total_sales: number;
        total_sales_percentage: number;
      };
    } = {};

    result.approved = {
      total_sales: totalSalesApproved,
      total_sales_percentage: calculatePercentage(
        totalSalesApproved,
        totalTransactions,
      ),
    };

    result.rejected = {
      total_sales: totalSalesRejected,
      total_sales_percentage: calculatePercentage(
        totalSalesRejected,
        totalTransactions,
      ),
    };

    result.pending = {
      total_sales: totalSalesPending,
      total_sales_percentage: calculatePercentage(
        totalSalesPending,
        totalTransactions,
      ),
    };

    result.expired = {
      total_sales: totalSalesExpired,
      total_sales_percentage: calculatePercentage(
        totalSalesExpired,
        totalTransactions,
      ),
    };

    return result;
  }

  async findPaymentMethodsSales(
    account_id: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<{
    [key: string]: {
      total_sales: number;
      total_sales_percentage: number;
    };
  }> {
    const baseWhere: FindOptionsWhere<TransactionEntity> = {
      event: {
        account_id: account_id,
        id: event_id ? event_id : undefined,
      },
      payment_status: 1,
    };

    if (start_date && end_date) {
      baseWhere.created_at = Between(start_date, end_date);
    }

    const [totalTransactions, totalSalesPix, totalSalesCreditCard] =
      await Promise.all([
        this.transactionRepository.count({ where: baseWhere }),
        this.transactionRepository.count({
          where: { ...baseWhere, payment_method: 'pix' },
        }),
        this.transactionRepository.count({
          where: { ...baseWhere, payment_method: 'credit_card' },
        }),
      ]);

    const calculatePercentage = (value: number, total: number): number =>
      total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;

    const result: {
      [key: string]: {
        total_sales: number;
        total_sales_percentage: number;
      };
    } = {};

    result.pix = {
      total_sales: totalSalesPix,
      total_sales_percentage: calculatePercentage(
        totalSalesPix,
        totalTransactions,
      ),
    };

    result.creditCard = {
      total_sales: totalSalesCreditCard,
      total_sales_percentage: calculatePercentage(
        totalSalesCreditCard,
        totalTransactions,
      ),
    };

    return result;
  }

  async findInstallmentsSales(
    account_id: string,
    event_id?: string,
    start_date?: Date,
    end_date?: Date,
  ): Promise<{
    total_sales_quantity: number;
    total_sales_expense_value: number;
    total_sales_revenue_value: number;
  }> {
    let where: FindOptionsWhere<TransactionEntity> = {
      event: {
        account_id: account_id,
        id: event_id ? event_id : undefined,
      },
      payment_status: 1,
      payment_installments: MoreThan(1),
    };

    if (start_date && end_date) {
      where.created_at = Between(start_date, end_date);
    }

    const totalSalesQuantity = await this.transactionRepository.count({
      where,
    });

    const totalSalesExpenseValue =
      await this.statementOrganizationService.sumByStatementType(
        account_id,
        'bank_spread',
        event_id,
        start_date,
        end_date,
      );

    const totalSalesRevenueValue =
      await this.statementOrganizationService.sumByStatementType(
        account_id,
        'customer_spread',
        event_id,
        start_date,
        end_date,
      );

    return {
      total_sales_quantity: totalSalesQuantity,
      total_sales_expense_value: totalSalesExpenseValue,
      total_sales_revenue_value: totalSalesRevenueValue,
    };
  }
}
