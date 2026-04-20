"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_service_1 = require("./audit.service");
const audit_log_entity_1 = require("./entities/audit_log.entity");
const audit_controller_1 = require("./audit.controller");
const auth_module_1 = require("../auth/auth.module");
const account_module_1 = require("../account/account.module");
const user_account_module_1 = require("../user_account/user_account.module");
const user_account_entity_1 = require("../user_account/entities/user_account.entity");
const role_guard_1 = require("../../guards/role.guard");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([audit_log_entity_1.AuditLogEntity, user_account_entity_1.UserAccountEntity]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => account_module_1.AccountModule),
            (0, common_1.forwardRef)(() => user_account_module_1.UserAccountModule),
        ],
        providers: [audit_service_1.AuditService, role_guard_1.RoleGuard],
        controllers: [audit_controller_1.AuditController],
        exports: [audit_service_1.AuditService],
    })
], AuditModule);
