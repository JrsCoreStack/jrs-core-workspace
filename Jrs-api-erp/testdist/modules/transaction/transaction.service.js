"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
const transaction_entity_1 = require("./entities/transaction.entity");
const event_service_1 = require("../event/event.service");
const statement_organization_service_1 = require("../statement_organization/statement_organization.service");
const statement_producer_service_1 = require("../statement_producer/statement_producer.service");
const audit_service_1 = require("../audit/audit.service");
let TransactionService = class TransactionService {
    transactionRepository;
    statementOrganizationService;
    statementProducerService;
    eventService;
    auditService;
    request;
    constructor(transactionRepository, statementOrganizationService, statementProducerService, eventService, auditService, request) {
        this.transactionRepository = transactionRepository;
        this.statementOrganizationService = statementOrganizationService;
        this.statementProducerService = statementProducerService;
        this.eventService = eventService;
        this.auditService = auditService;
        this.request = request;
    }
    async create(createTransactionDTO) {
        await this.eventService.findById(createTransactionDTO.event_id);
        const dto = Object.assign(new create_1.CreateTransactionDTO(), createTransactionDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const transaction = this.transactionRepository.create(createTransactionDTO);
        const savedTransaction = await this.transactionRepository.save(transaction);
        // Log de auditoria
        await this.auditService.log({
            table_name: 'erp_transaction',
            record_id: savedTransaction.id,
            operation: 'INSERT',
            new_values: savedTransaction,
            ...this.request.auditData,
        });
        return savedTransaction;
    }
    async findAll(account_id, event_id, bank_id, limit, offset, payment_id, payment_status, start_date, end_date, payment_method) {
        const where = {
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
                ? (0, typeorm_2.In)(payment_method)
                : payment_method;
        }
        if (payment_status !== undefined && payment_status !== null) {
            where.payment_status = Array.isArray(payment_status)
                ? (0, typeorm_2.In)(payment_status)
                : Number(payment_status);
        }
        if (start_date && end_date) {
            where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
    async findTotalTransactions(account_id, event_id, bank_id, start_date, end_date) {
        let where = {
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
            where.created_at = (0, typeorm_2.Between)(start_date, end_date);
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
        const totalNetValue = await this.statementOrganizationService.sumStatementsAll(account_id, start_date, end_date, event_id, bank_id);
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
                        }
                        else if (statement.statement_type.name === 'bank_spread') {
                            bankSpreadStatements += statementValue;
                        }
                    }
                    else if (statement.type === 'income') {
                        const statementValue = Number(statement.amount) || 0;
                        incomeStatementsTotal += statementValue;
                        if (statement.statement_type.name === 'customer_fee') {
                            customerTaxesStatements += statementValue;
                        }
                        else if (statement.statement_type.name === 'customer_spread') {
                            customerSpreadStatements += statementValue;
                        }
                        else if (statement.statement_type.name === 'fee_negotiated_customer') {
                            negotiatedTaxesProducerTotal += statementValue;
                        }
                        else if (statement.statement_type.name === 'fee_negotiated_pixps') {
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
            negotiated_taxes_producer_total: Number(negotiatedTaxesProducerTotal.toFixed(2)),
            negotiated_taxes_pixps_total: Number(negotiatedTaxesPixpsTotal.toFixed(2)),
            quantity: transactions.length,
        };
    }
    async findById(account_id, id) {
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
            throw new common_1.BadRequestException(`Transação não encontrada.`);
        }
        const sumStatements = await this.statementOrganizationService.sumStatementsByTransactionId(account_id, id);
        return {
            data: transaction,
            bank_fee: transaction.statements_organization.filter((item) => item.statement_type.name === 'bank_fee')[0]?.amount,
            bank_spread: transaction.statements_organization.filter((item) => item.statement_type.name === 'bank_spread')[0]?.amount,
            product_value: transaction.statements_producer.filter((item) => item.statement_type.name === 'product_value')[0]?.amount,
            fee_negotiated_customer: transaction.statements_organization.filter((item) => item.statement_type.name === 'fee_negotiated_customer')[0]?.amount,
            fee_negotiated_pixps: transaction.statements_organization.filter((item) => item.statement_type.name === 'fee_negotiated_pixps')[0]?.amount,
            total_net: sumStatements,
        };
    }
    async findStatusSales(account_id, event_id, start_date, end_date) {
        const baseWhere = {
            event: {
                account_id: account_id,
                id: event_id ? event_id : undefined,
            },
        };
        if (start_date && end_date) {
            baseWhere.created_at = (0, typeorm_2.Between)(start_date, end_date);
        }
        const [totalTransactions, totalSalesApproved, totalSalesRejected, totalSalesPending, totalSalesExpired,] = await Promise.all([
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
        const calculatePercentage = (value, total) => total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;
        const result = {};
        result.approved = {
            total_sales: totalSalesApproved,
            total_sales_percentage: calculatePercentage(totalSalesApproved, totalTransactions),
        };
        result.rejected = {
            total_sales: totalSalesRejected,
            total_sales_percentage: calculatePercentage(totalSalesRejected, totalTransactions),
        };
        result.pending = {
            total_sales: totalSalesPending,
            total_sales_percentage: calculatePercentage(totalSalesPending, totalTransactions),
        };
        result.expired = {
            total_sales: totalSalesExpired,
            total_sales_percentage: calculatePercentage(totalSalesExpired, totalTransactions),
        };
        return result;
    }
    async findPaymentMethodsSales(account_id, event_id, start_date, end_date) {
        const baseWhere = {
            event: {
                account_id: account_id,
                id: event_id ? event_id : undefined,
            },
            payment_status: 1,
        };
        if (start_date && end_date) {
            baseWhere.created_at = (0, typeorm_2.Between)(start_date, end_date);
        }
        const [totalTransactions, totalSalesPix, totalSalesCreditCard] = await Promise.all([
            this.transactionRepository.count({ where: baseWhere }),
            this.transactionRepository.count({
                where: { ...baseWhere, payment_method: 'pix' },
            }),
            this.transactionRepository.count({
                where: { ...baseWhere, payment_method: 'credit_card' },
            }),
        ]);
        const calculatePercentage = (value, total) => total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;
        const result = {};
        result.pix = {
            total_sales: totalSalesPix,
            total_sales_percentage: calculatePercentage(totalSalesPix, totalTransactions),
        };
        result.creditCard = {
            total_sales: totalSalesCreditCard,
            total_sales_percentage: calculatePercentage(totalSalesCreditCard, totalTransactions),
        };
        return result;
    }
    async findInstallmentsSales(account_id, event_id, start_date, end_date) {
        let where = {
            event: {
                account_id: account_id,
                id: event_id ? event_id : undefined,
            },
            payment_status: 1,
            payment_installments: (0, typeorm_2.MoreThan)(1),
        };
        if (start_date && end_date) {
            where.created_at = (0, typeorm_2.Between)(start_date, end_date);
        }
        const totalSalesQuantity = await this.transactionRepository.count({
            where,
        });
        const totalSalesExpenseValue = await this.statementOrganizationService.sumByStatementType(account_id, 'bank_spread', event_id, start_date, end_date);
        const totalSalesRevenueValue = await this.statementOrganizationService.sumByStatementType(account_id, 'customer_spread', event_id, start_date, end_date);
        return {
            total_sales_quantity: totalSalesQuantity,
            total_sales_expense_value: totalSalesExpenseValue,
            total_sales_revenue_value: totalSalesRevenueValue,
        };
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.TransactionEntity)),
    __param(5, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        statement_organization_service_1.StatementOrganizationService,
        statement_producer_service_1.StatementProducerService,
        event_service_1.EventService,
        audit_service_1.AuditService, Object])
], TransactionService);
