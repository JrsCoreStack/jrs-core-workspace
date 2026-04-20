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
exports.StatementProducerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const create_1 = require("./dtos/create");
const class_validator_1 = require("class-validator");
const statement_producer_entity_1 = require("./entities/statement_producer.entity");
let StatementProducerService = class StatementProducerService {
    statementProducerRepository;
    constructor(statementProducerRepository) {
        this.statementProducerRepository = statementProducerRepository;
    }
    async create(account_id, createStatementProducerDTO) {
        // await this.transactionService.findById(
        //   account_id,
        //   createStatementProducerDTO.transaction_id,
        // );
        const dto = Object.assign(new create_1.CreateStatementProducerDTO(), createStatementProducerDTO);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const errorMessages = errors.map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new common_1.BadRequestException(`Dados inválidos: ${errorMessages.join(', ')}`);
        }
        const statement = this.statementProducerRepository.create({
            ...createStatementProducerDTO,
        });
        return this.statementProducerRepository.save(statement);
    }
    async findAll(account_id, limit, offset) {
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
    async totalRevenue(account_id, event_id, start_date, end_date) {
        let where = {
            account_id: account_id,
            transaction: {
                payment_status: 1,
                event_id: event_id ? event_id : undefined,
            },
        };
        if (start_date && end_date) {
            where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
        }
        const total = await this.statementProducerRepository.sum('amount', where);
        return total;
    }
    async totalNetByTransaction(account_id, limit, offset, statement_type_names, start_date, end_date) {
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
                    : new Date('1970-01-01')).toISOString(),
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
                },
            };
            if (start_date && end_date) {
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
                    : new Date('1970-01-01')).toISOString(),
                end_date: (end_date ? new Date(end_date) : new Date()).toISOString(),
            })
                .select('COUNT(DISTINCT statement.transaction_id)', 'count')
                .getRawOne();
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
                },
            };
            if (start_date && end_date) {
                where.created_at = (0, typeorm_2.Between)(new Date(start_date), new Date(end_date));
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
                    ? parseFloat((Number(statement.transaction_total) -
                        Number(statement.statement_total)).toFixed(2))
                    : Number(statement.amount),
            })),
            total: !statement_type_names
                ? Number(countStatements.count)
                : countStatements,
        };
    }
};
exports.StatementProducerService = StatementProducerService;
exports.StatementProducerService = StatementProducerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(statement_producer_entity_1.StatementProducerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StatementProducerService);
