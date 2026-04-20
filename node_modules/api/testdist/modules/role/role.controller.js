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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const role_service_1 = require("./role.service");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const permission_guard_1 = require("src/guards/permission.guard");
const permission_decorator_1 = require("src/decorators/permission.decorator");
const permission_enum_1 = require("src/utils/enums/permission.enum");
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async findAll() {
        // Rota para listar roles (necessário para cadastro de colaboradores)
        // Retorna apenas id, name e description (sem permissões detalhadas)
        const roles = await this.roleService.findAll(false);
        return roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            created_at: role.created_at,
        }));
    }
    async findById(id) {
        return this.roleService.findById(id);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard, permission_guard_1.PermissionGuard),
    (0, permission_decorator_1.RequirePermission)(permission_enum_1.Permission.ADMIN_ALL),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findById", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('Pap�is (Roles)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('role'),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
