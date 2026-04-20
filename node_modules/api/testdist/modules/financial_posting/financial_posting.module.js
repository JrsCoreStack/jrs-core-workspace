"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialPostingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_posting_controller_1 = require("./financial_posting.controller");
const financial_posting_service_1 = require("./financial_posting.service");
const financial_entry_entity_1 = require("../financial_entry/entities/financial_entry.entity");
const financial_chart_of_accounts_module_1 = require("../financial_chart_of_accounts/financial_chart_of_accounts.module");
const account_module_1 = require("../account/account.module");
const financial_gateway_fee_rule_module_1 = require("../financial_gateway_fee_rule/financial_gateway_fee_rule.module");
let FinancialPostingModule = class FinancialPostingModule {
};
exports.FinancialPostingModule = FinancialPostingModule;
exports.FinancialPostingModule = FinancialPostingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([financial_entry_entity_1.FinancialEntryEntity]),
            financial_chart_of_accounts_module_1.FinancialChartOfAccountsModule,
            account_module_1.AccountModule,
            financial_gateway_fee_rule_module_1.FinancialGatewayFeeRuleModule,
        ],
        controllers: [financial_posting_controller_1.FinancialPostingController],
        providers: [financial_posting_service_1.FinancialPostingService],
        exports: [financial_posting_service_1.FinancialPostingService],
    })
], FinancialPostingModule);
