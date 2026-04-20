"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesSyncModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sales_sync_service_1 = require("./sales-sync.service");
const sales_sync_controller_1 = require("./sales-sync.controller");
const sales_sync_status_entity_1 = require("./entities/sales-sync-status.entity");
const financial_entry_entity_1 = require("../financial_entry/entities/financial_entry.entity");
const financial_posting_module_1 = require("../financial_posting/financial_posting.module");
const financial_entry_module_1 = require("../financial_entry/financial_entry.module");
const auth_module_1 = require("../auth/auth.module");
let SalesSyncModule = class SalesSyncModule {
};
exports.SalesSyncModule = SalesSyncModule;
exports.SalesSyncModule = SalesSyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([sales_sync_status_entity_1.SalesSyncStatusEntity, financial_entry_entity_1.FinancialEntryEntity]),
            financial_posting_module_1.FinancialPostingModule,
            financial_entry_module_1.FinancialEntryModule,
            auth_module_1.AuthModule,
        ],
        controllers: [sales_sync_controller_1.SalesSyncController],
        providers: [sales_sync_service_1.SalesSyncService],
        exports: [sales_sync_service_1.SalesSyncService],
    })
], SalesSyncModule);
