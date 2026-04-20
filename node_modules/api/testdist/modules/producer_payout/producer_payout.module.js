"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducerPayoutModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const producer_payout_service_1 = require("./producer_payout.service");
const producer_payout_controller_1 = require("./producer_payout.controller");
const financial_entry_entity_1 = require("../financial_entry/entities/financial_entry.entity");
const manual_payout_entity_1 = require("./entities/manual_payout.entity");
const account_entity_1 = require("../account/entities/account.entity");
const financial_chart_of_accounts_module_1 = require("../financial_chart_of_accounts/financial_chart_of_accounts.module");
const account_module_1 = require("../account/account.module");
const financial_entry_module_1 = require("../financial_entry/financial_entry.module");
let ProducerPayoutModule = class ProducerPayoutModule {
};
exports.ProducerPayoutModule = ProducerPayoutModule;
exports.ProducerPayoutModule = ProducerPayoutModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([financial_entry_entity_1.FinancialEntryEntity, manual_payout_entity_1.ManualPayoutEntity, account_entity_1.AccountEntity]),
            financial_chart_of_accounts_module_1.FinancialChartOfAccountsModule,
            account_module_1.AccountModule,
            financial_entry_module_1.FinancialEntryModule,
        ],
        controllers: [producer_payout_controller_1.ProducerPayoutController],
        providers: [producer_payout_service_1.ProducerPayoutService],
        exports: [producer_payout_service_1.ProducerPayoutService],
    })
], ProducerPayoutModule);
