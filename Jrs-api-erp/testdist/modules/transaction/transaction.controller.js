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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_service_1 = require("./transaction.service");
const create_1 = require("./dtos/create");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const account_decorator_1 = require("src/decorators/account.decorator");
let TransactionController = class TransactionController {
    transactionService;
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async create(createTransaction) {
        return this.transactionService.create(createTransaction);
    }
    async findAll(account_id, event_id, bank_id, limit, offset, payment_id, payment_status, start_date, end_date, payment_method) {
        return this.transactionService.findAll(account_id, event_id, bank_id, limit, offset, payment_id, payment_status, start_date, end_date, payment_method);
    }
    async findStatusSales(account_id, event_id, start_date, end_date) {
        return this.transactionService.findStatusSales(account_id, event_id, start_date, end_date);
    }
    async findPaymentMethodsSales(account_id, event_id, start_date, end_date) {
        return this.transactionService.findPaymentMethodsSales(account_id, event_id, start_date, end_date);
    }
    async findInstallmentSales(account_id, event_id, start_date, end_date) {
        return this.transactionService.findInstallmentsSales(account_id, event_id, start_date, end_date);
    }
    async findTotalTransactions(account_id, event_id, bank_id, start_date, end_date) {
        return this.transactionService.findTotalTransactions(account_id, event_id, bank_id, start_date, end_date);
    }
    async findById(account_id, id) {
        return this.transactionService.findById(account_id, id);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateTransactionDTO]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)(),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('bank_id')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __param(5, (0, common_1.Query)('payment_id')),
    __param(6, (0, common_1.Query)('payment_status')),
    __param(7, (0, common_1.Query)('start_date')),
    __param(8, (0, common_1.Query)('end_date')),
    __param(9, (0, common_1.Query)('payment_method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findStatusSales", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('payment_methods'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findPaymentMethodsSales", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('installments'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findInstallmentSales", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('total'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('bank_id')),
    __param(3, (0, common_1.Query)('start_date')),
    __param(4, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findTotalTransactions", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findById", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transa��es'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transaction'),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
