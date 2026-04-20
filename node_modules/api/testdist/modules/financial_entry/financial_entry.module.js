"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialEntryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_entry_service_1 = require("./financial_entry.service");
const financial_entry_controller_1 = require("./financial_entry.controller");
const financial_entry_entity_1 = require("./entities/financial_entry.entity");
const account_entity_1 = require("../account/entities/account.entity");
let FinancialEntryModule = class FinancialEntryModule {
};
exports.FinancialEntryModule = FinancialEntryModule;
exports.FinancialEntryModule = FinancialEntryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([financial_entry_entity_1.FinancialEntryEntity, account_entity_1.AccountEntity])],
        controllers: [financial_entry_controller_1.FinancialEntryController],
        providers: [financial_entry_service_1.FinancialEntryService],
        exports: [financial_entry_service_1.FinancialEntryService],
    })
], FinancialEntryModule);
