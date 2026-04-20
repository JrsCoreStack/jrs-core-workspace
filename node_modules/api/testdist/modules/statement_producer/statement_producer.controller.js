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
exports.StatementProducerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const account_decorator_1 = require("src/decorators/account.decorator");
const statement_producer_service_1 = require("./statement_producer.service");
const create_1 = require("./dtos/create");
let StatementProducerController = class StatementProducerController {
    statementProducerService;
    constructor(statementProducerService) {
        this.statementProducerService = statementProducerService;
    }
    async create(account_id, createStatement) {
        return this.statementProducerService.create(account_id, createStatement);
    }
    async totalNetByTransaction(account_id, limit, offset, statement_type_names, start_date, end_date) {
        return this.statementProducerService.totalNetByTransaction(account_id, limit, offset, statement_type_names, start_date, end_date);
    }
    async totalRevenue(account_id, event_id, start_date, end_date) {
        return this.statementProducerService.totalRevenue(account_id, event_id, start_date, end_date);
    }
    async findAll(account_id, limit, offset) {
        return this.statementProducerService.findAll(account_id, limit, offset);
    }
};
exports.StatementProducerController = StatementProducerController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Post)(),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_1.CreateStatementProducerDTO]),
    __metadata("design:returntype", Promise)
], StatementProducerController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('/totals/net'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('statement_type_names')),
    __param(4, (0, common_1.Query)('start_date')),
    __param(5, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Array, String, String]),
    __metadata("design:returntype", Promise)
], StatementProducerController.prototype, "totalNetByTransaction", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)('/revenue'),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], StatementProducerController.prototype, "totalRevenue", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    (0, common_1.Get)(),
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], StatementProducerController.prototype, "findAll", null);
exports.StatementProducerController = StatementProducerController = __decorate([
    (0, swagger_1.ApiTags)('Extrato � Produtor'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('statement_producer'),
    __metadata("design:paramtypes", [statement_producer_service_1.StatementProducerService])
], StatementProducerController);
