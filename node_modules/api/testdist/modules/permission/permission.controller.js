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
exports.PermissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permission_service_1 = require("./permission.service");
const permission_entity_1 = require("./entities/permission.entity");
const auth_guard_1 = require("src/guards/auth.guard");
const account_guard_1 = require("src/guards/account.guard");
const permission_guard_1 = require("src/guards/permission.guard");
const permission_decorator_1 = require("src/decorators/permission.decorator");
const permission_enum_1 = require("src/utils/enums/permission.enum");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PermissionController = class PermissionController {
    permissionService;
    permissionRepository;
    constructor(permissionService, permissionRepository) {
        this.permissionService = permissionService;
        this.permissionRepository = permissionRepository;
    }
    async findAll() {
        return this.permissionRepository.find({
            order: {
                module: 'ASC',
                name: 'ASC',
            },
        });
    }
    async findById(id) {
        const permission = await this.permissionRepository.findOne({
            where: { id },
            relations: ['role_permissions', 'role_permissions.role'],
        });
        if (!permission) {
            throw new Error(`Permissão com ID ${id} não encontrada.`);
        }
        return permission;
    }
    async findByRole(roleId) {
        const permissions = await this.permissionRepository
            .createQueryBuilder('permission')
            .innerJoin('permission.role_permissions', 'rp')
            .where('rp.role_id = :roleId', { roleId })
            .orderBy('permission.module', 'ASC')
            .addOrderBy('permission.name', 'ASC')
            .getMany();
        return permissions;
    }
};
exports.PermissionController = PermissionController;
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.RequirePermission)(permission_enum_1.Permission.ADMIN_ALL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permission_decorator_1.RequirePermission)(permission_enum_1.Permission.ADMIN_ALL),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by-role/:roleId'),
    (0, permission_decorator_1.RequirePermission)(permission_enum_1.Permission.ADMIN_ALL),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findByRole", null);
exports.PermissionController = PermissionController = __decorate([
    (0, swagger_1.ApiTags)('Permiss�es'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('permission'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, account_guard_1.AccountGuard, permission_guard_1.PermissionGuard),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.PermissionEntity)),
    __metadata("design:paramtypes", [permission_service_1.PermissionService,
        typeorm_2.Repository])
], PermissionController);
