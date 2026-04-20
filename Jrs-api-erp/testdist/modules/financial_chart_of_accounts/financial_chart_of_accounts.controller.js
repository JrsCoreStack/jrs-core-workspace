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
exports.FinancialChartOfAccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_chart_of_accounts_service_1 = require("./financial_chart_of_accounts.service");
const create_1 = require("./dtos/create");
let FinancialChartOfAccountsController = class FinancialChartOfAccountsController {
    chartOfAccountsService;
    constructor(chartOfAccountsService) {
        this.chartOfAccountsService = chartOfAccountsService;
    }
    async create(createChartOfAccounts) {
        return this.chartOfAccountsService.create(createChartOfAccounts);
    }
    async findAll() {
        return this.chartOfAccountsService.findAll();
    }
    async findById(id) {
        return this.chartOfAccountsService.findById(id);
    }
    async findByAccountId(account_id) {
        return this.chartOfAccountsService.findByAccountId(account_id);
    }
};
exports.FinancialChartOfAccountsController = FinancialChartOfAccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateFinancialChartOfAccountsDTO]),
    __metadata("design:returntype", Promise)
], FinancialChartOfAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialChartOfAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialChartOfAccountsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('account/:account_id'),
    __param(0, (0, common_1.Param)('account_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialChartOfAccountsController.prototype, "findByAccountId", null);
exports.FinancialChartOfAccountsController = FinancialChartOfAccountsController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro � Plano de Contas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('financial_chart_of_accounts'),
    __metadata("design:paramtypes", [financial_chart_of_accounts_service_1.FinancialChartOfAccountsService])
], FinancialChartOfAccountsController);
