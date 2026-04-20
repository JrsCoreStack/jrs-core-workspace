"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementOrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const statement_organization_controller_1 = require("./statement_organization.controller");
const statement_organization_entity_1 = require("./entities/statement_organization.entity");
const statement_organization_service_1 = require("./statement_organization.service");
const auth_module_1 = require("../auth/auth.module");
const user_account_entity_1 = require("../user_account/entities/user_account.entity");
const role_guard_1 = require("src/guards/role.guard");
const audit_module_1 = require("../audit/audit.module");
let StatementOrganizationModule = class StatementOrganizationModule {
};
exports.StatementOrganizationModule = StatementOrganizationModule;
exports.StatementOrganizationModule = StatementOrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([statement_organization_entity_1.StatementOrganizationEntity, user_account_entity_1.UserAccountEntity]),
            // TransactionModule,
            auth_module_1.AuthModule,
            audit_module_1.AuditModule,
        ],
        controllers: [statement_organization_controller_1.StatementOrganizationController],
        providers: [statement_organization_service_1.StatementOrganizationService, role_guard_1.RoleGuard],
        exports: [statement_organization_service_1.StatementOrganizationService],
    })
], StatementOrganizationModule);
