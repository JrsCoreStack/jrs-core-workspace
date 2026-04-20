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
exports.FinancialEntryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_entry_service_1 = require("./financial_entry.service");
const list_query_dto_1 = require("./dtos/list-query.dto");
let FinancialEntryController = class FinancialEntryController {
    financialEntryService;
    constructor(financialEntryService) {
        this.financialEntryService = financialEntryService;
    }
    async findAll() {
        return this.financialEntryService.findAll();
    }
    async findAllPaginated(query) {
        return this.financialEntryService.findAllPaginated(query);
    }
    async findById(id) {
        return this.financialEntryService.findById(id);
    }
    async findFinancialStats(account_id, start_date, end_date) {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        return this.financialEntryService.findFinancialStats(account_id, startDate, endDate);
    }
    async findByAccountId(account_id) {
        return this.financialEntryService.findByAccountId(account_id);
    }
    async getEventBalances(account_id, start_date, end_date, event_id, event_name) {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        return this.financialEntryService.getEventBalances(account_id, startDate, endDate, event_id, event_name);
    }
    async getEventFinancialBalance(account_id, start_date, end_date, event_id, event_name) {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        return this.financialEntryService.getEventFinancialBalance(account_id, startDate, endDate, event_id, event_name);
    }
    async getEventFinancialBalanceSummary(account_id, start_date, end_date, event_id, event_name) {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        return this.financialEntryService.getEventFinancialBalanceSummary(account_id, startDate, endDate, event_id, event_name);
    }
};
exports.FinancialEntryController = FinancialEntryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_query_dto_1.ListFinancialEntriesQueryDTO]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('stats/:account_id'),
    __param(0, (0, common_1.Param)('account_id')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "findFinancialStats", null);
__decorate([
    (0, common_1.Get)('account/:account_id'),
    __param(0, (0, common_1.Param)('account_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "findByAccountId", null);
__decorate([
    (0, common_1.Get)('events/balances'),
    __param(0, (0, common_1.Query)('account_id')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('event_id')),
    __param(4, (0, common_1.Query)('event_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "getEventBalances", null);
__decorate([
    (0, common_1.Get)('events/financial-balance'),
    __param(0, (0, common_1.Query)('account_id')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('event_id')),
    __param(4, (0, common_1.Query)('event_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "getEventFinancialBalance", null);
__decorate([
    (0, common_1.Get)('events/financial-balance/summary'),
    __param(0, (0, common_1.Query)('account_id')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('event_id')),
    __param(4, (0, common_1.Query)('event_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialEntryController.prototype, "getEventFinancialBalanceSummary", null);
exports.FinancialEntryController = FinancialEntryController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro � Lan�amentos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('financial_entry'),
    __metadata("design:paramtypes", [financial_entry_service_1.FinancialEntryService])
], FinancialEntryController);
