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
exports.StatementOrganizationService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
const statement_organization_entity_1 = require("./entities/statement_organization.entity");
const date_fns_1 = require("date-fns");
const audit_service_1 = require("../audit/audit.service");
// import { TransactionService } from '../transaction/transaction.service';
let StatementOrganizationService = class StatementOrganizationService {
    statementOrganizationRepository;
    auditService;
    request;
    constructor(statementOrganizationRepository, auditService, request) {
        this.statementOrganizationRepository = statementOrganizationRepository;
        this.auditService = auditService;
        this.request = request;
    }
    async create(account_id, createStatementOrganizationDTO) {
        // await this.transactionService.findById(
        //   account_id,
        //   createStatementOrganizationDTO.transaction_id,
        // );
        const dto = Object.assign(new create_1.CreateStatementOrganizationDTO(), createStatementOrganizationDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const statement = this.statementOrganizationRepository.create({
            ...createStatementOrganizationDTO,
        });
        const savedStatement = await this.statementOrganizationRepository.save(statement);
        // Log de auditoria
        await this.auditService.log({
            table_name: 'erp_statement_organization',
            record_id: savedStatement.id,
            operation: 'INSERT',
            new_values: savedStatement,
            account_id: account_id,
            ...this.request.auditData,
        });
        return savedStatement;
    }
    async findAll(account_id, limit, offset) {
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
    async sumStatementsByTransactionId(account_id, transaction_id) {
        const total = await this.statementOrganizationRepository.sum('amount', {
            account_id: account_id,
            transaction: {
                payment_status: 1,
                id: transaction_id,
            },
        });
        return total || 0;
    }
    async sumByStatementType(account_id, statement_type, event_id, start_date, end_date) {
        let where = {
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
            where.created_at = (0, typeorm_2.Between)(start_date, end_date);
        }
        const total = await this.statementOrganizationRepository.sum('amount', where);
        return total || 0;
    }
    async sumStatementsAll(account_id, start_date, end_date, event_id, bank_id) {
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
    async totalNetByTransaction(account_id, event_id, bank_id, limit, offset, payment_id, statement_type_names, start_date, end_date, isExport) {
        let statements;
        if (!statement_type_names) {
            let where = {
                account_id: account_id,
                transaction: {
                    payment_status: 1,
                    payment_id: payment_id ? payment_id : undefined,
                    bank_id: bank_id ? bank_id : undefined,
                },
            };
            if (start_date && end_date) {
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
        else {
            let where = {
                statement_type: {
                    name: Array.isArray(statement_type_names)
                        ? (0, typeorm_2.In)(statement_type_names)
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
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
            let where = {
                account_id: account_id,
                transaction: {
                    payment_status: 1,
                    payment_id: payment_id ? payment_id : undefined,
                },
            };
            if (start_date && end_date) {
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
            }
            if (event_id) {
                where.event_id = event_id;
            }
            countStatements = await this.statementOrganizationRepository.count({
                where,
            });
        }
        else {
            let where = {
                statement_type: {
                    name: Array.isArray(statement_type_names)
                        ? (0, typeorm_2.In)(statement_type_names)
                        : String(statement_type_names),
                },
                account_id: account_id,
                transaction: {
                    payment_status: 1,
                    payment_id: payment_id ? payment_id : undefined,
                },
            };
            if (start_date && end_date) {
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
                data: statements.map((statement) => ({
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
        }
        else {
            return {
                data: Object.values(statements.reduce((acc, statement) => {
                    const date = (0, date_fns_1.format)(new Date(statement.transaction?.created_at || '1970-01-01'), 'yyyy-MM-dd');
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
                        transaction_payment_method: statement.transaction?.payment_method,
                        transaction_event_name: statement.event?.name,
                        total: Number(statement.amount),
                    });
                    return acc;
                }, {})),
                total: countStatements,
            };
        }
    }
    async totalRevenue(account_id, event_id, start_date, end_date) {
        let where = {
            account_id: account_id,
            transaction: {
                payment_status: 1,
                event_id: event_id ? event_id : undefined,
            },
        };
        if (start_date && end_date) {
            where.created_at = (0, typeorm_2.Between)(start_date, end_date);
        }
        const total = await this.statementOrganizationRepository.sum('amount', where);
        return total;
    }
    async metricsByEvent(account_id, limit, offset, order_by, event_name, event_id, start_date, end_date) {
        const baseQuery = this.statementOrganizationRepository
            .createQueryBuilder('fso')
            .select('e.id', 'event_id')
            .addSelect('e.name', 'event_name')
            .addSelect('e.start_date', 'start_date')
            .addSelect('e.end_date', 'end_date')
            .addSelect(`SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END)`, 'total_income')
            .addSelect(`SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END)`, 'total_expense')
            .addSelect(`
      SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) +
      SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END)
    `, 'total_revenue')
            .addSelect(`
        (SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) /
         (SUM(CASE WHEN fso.type = 'income' THEN fso.amount ELSE 0 END) -
          SUM(CASE WHEN fso.type = 'expense' THEN fso.amount ELSE 0 END))) * 100
        `, 'total_margin')
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
        }
        else {
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
        const totalIncome = await this.statementOrganizationRepository.sum('amount', {
            account_id: account_id,
            type: 'income',
            created_at: (0, typeorm_2.Between)(start_date || new Date(0), end_date || new Date()),
            transaction: {
                payment_status: 1,
                event_id: event_id ? event_id : undefined,
            },
        });
        const totalExpense = await this.statementOrganizationRepository.sum('amount', {
            account_id: account_id,
            type: 'expense',
            created_at: (0, typeorm_2.Between)(start_date || new Date(0), end_date || new Date()),
            transaction: {
                payment_status: 1,
                event_id: event_id ? event_id : undefined,
            },
        });
        100;
        const totalRevenue = await this.statementOrganizationRepository.sum('amount', {
            account_id: account_id,
            created_at: (0, typeorm_2.Between)(start_date || new Date(0), end_date || new Date()),
            transaction: {
                payment_status: 1,
                event_id: event_id ? event_id : undefined,
            },
        });
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
};
exports.StatementOrganizationService = StatementOrganizationService;
exports.StatementOrganizationService = StatementOrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(statement_organization_entity_1.StatementOrganizationEntity)),
    __param(2, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService, Object])
], StatementOrganizationService);
