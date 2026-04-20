"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialChartOfAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_chart_of_accounts_entity_1 = require("./entities/financial_chart_of_accounts.entity");
const financial_chart_of_accounts_controller_1 = require("./financial_chart_of_accounts.controller");
const financial_chart_of_accounts_service_1 = require("./financial_chart_of_accounts.service");
let FinancialChartOfAccountsModule = class FinancialChartOfAccountsModule {
};
exports.FinancialChartOfAccountsModule = FinancialChartOfAccountsModule;
exports.FinancialChartOfAccountsModule = FinancialChartOfAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity])],
        controllers: [financial_chart_of_accounts_controller_1.FinancialChartOfAccountsController],
        providers: [financial_chart_of_accounts_service_1.FinancialChartOfAccountsService],
        exports: [financial_chart_of_accounts_service_1.FinancialChartOfAccountsService],
    })
], FinancialChartOfAccountsModule);
