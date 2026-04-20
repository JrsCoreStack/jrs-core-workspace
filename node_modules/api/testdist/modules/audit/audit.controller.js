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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const auth_guard_1 = require("../../guards/auth.guard");
const account_guard_1 = require("../../guards/account.guard");
const role_guard_1 = require("../../guards/role.guard");
const account_decorator_1 = require("../../decorators/account.decorator");
const user_decorator_1 = require("../../decorators/user.decorator");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    // @Roles(UserAccountRole.ADMIN)
    async getAuditByAccount(accountId, limit, offset) {
        return this.auditService.getAuditByAccount(accountId, limit || 100, offset || 0);
    }
    // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
    async getAuditByUser(userId, accountId, limit, offset) {
        return this.auditService.getAuditByUser(userId, accountId, limit || 100, offset || 0);
    }
    // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
    async getAuditHistory(tableName, recordId, accountId) {
        return this.auditService.getAuditHistory(tableName, recordId, accountId);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('/account')
    // @Roles(UserAccountRole.ADMIN)
    ,
    __param(0, (0, account_decorator_1.CurrentAccountId)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditByAccount", null);
__decorate([
    (0, common_1.Get)('/user')
    // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
    ,
    __param(0, (0, user_decorator_1.CurrentUserId)()),
    __param(1, (0, account_decorator_1.CurrentAccountId)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditByUser", null);
__decorate([
    (0, common_1.Get)('/record/:tableName/:recordId')
    // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
    ,
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Param)('recordId')),
    __param(2, (0, account_decorator_1.CurrentAccountId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditHistory", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Auditoria'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard, role_guard_1.RoleGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
