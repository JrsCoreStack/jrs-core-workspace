"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_controller_1 = require("./transaction.controller");
const transaction_entity_1 = require("./entities/transaction.entity");
const transaction_service_1 = require("./transaction.service");
const event_module_1 = require("../event/event.module");
const account_module_1 = require("../account/account.module");
const auth_module_1 = require("../auth/auth.module");
const statement_organization_module_1 = require("../statement_organization/statement_organization.module");
const statement_producer_module_1 = require("../statement_producer/statement_producer.module");
const audit_module_1 = require("../audit/audit.module");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.TransactionEntity]),
            event_module_1.EventModule,
            account_module_1.AccountModule,
            auth_module_1.AuthModule,
            statement_organization_module_1.StatementOrganizationModule,
            statement_producer_module_1.StatementProducerModule,
            audit_module_1.AuditModule,
        ],
        controllers: [transaction_controller_1.TransactionController],
        providers: [transaction_service_1.TransactionService],
        exports: [transaction_service_1.TransactionService],
    })
], TransactionModule);
