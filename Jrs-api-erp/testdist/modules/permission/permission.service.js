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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("./entities/permission.entity");
const role_entity_1 = require("src/modules/role/entities/role.entity");
const user_account_entity_1 = require("src/modules/user_account/entities/user_account.entity");
const permission_enum_1 = require("src/utils/enums/permission.enum");
const user_role_enum_1 = require("src/utils/enums/user_role.enum");
let PermissionService = class PermissionService {
    permissionRepository;
    roleRepository;
    userAccountRepository;
    constructor(permissionRepository, roleRepository, userAccountRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userAccountRepository = userAccountRepository;
    }
    /**
     * Verifica se um usuário tem uma permissão específica em uma conta
     */
    async hasPermission(userId, accountId, permission) {
        const userAccount = await this.userAccountRepository.findOne({
            where: {
                user_id: userId,
                account_id: accountId,
            },
            relations: ['role'],
        });
        if (!userAccount || !userAccount.role_id || !userAccount.role) {
            return false;
        }
        // ADMIN tem todas as permissões
        if (userAccount.role.name === user_role_enum_1.UserRole.ADMIN) {
            return true;
        }
        // Verificar se o role tem a permissão
        const role = await this.roleRepository.findOne({
            where: { id: userAccount.role_id },
            relations: ['role_permissions', 'role_permissions.permission'],
        });
        if (!role) {
            return false;
        }
        return role.role_permissions.some((rp) => rp.permission.name === permission);
    }
    /**
     * Retorna todas as permissões de um usuário em uma conta
     */
    async getUserPermissions(userId, accountId) {
        const userAccount = await this.userAccountRepository.findOne({
            where: {
                user_id: userId,
                account_id: accountId,
            },
            relations: ['role'],
        });
        if (!userAccount || !userAccount.role) {
            return [];
        }
        // ADMIN tem todas as permissões
        if (userAccount.role.name === user_role_enum_1.UserRole.ADMIN) {
            return Object.values(permission_enum_1.Permission);
        }
        // Buscar permissões do role
        const role = await this.roleRepository.findOne({
            where: { id: userAccount.role_id },
            relations: ['role_permissions', 'role_permissions.permission'],
        });
        if (!role) {
            return [];
        }
        return role.role_permissions.map((rp) => rp.permission.name);
    }
    /**
     * Verifica se um usuário tem um role específico em uma conta
     */
    async hasRole(userId, accountId, role) {
        const userAccount = await this.userAccountRepository.findOne({
            where: {
                user_id: userId,
                account_id: accountId,
            },
            relations: ['role'],
        });
        if (!userAccount || !userAccount.role) {
            return false;
        }
        return userAccount.role.name === role;
    }
    /**
     * Retorna o role de um usuário em uma conta
     */
    async getUserRole(userId, accountId) {
        const userAccount = await this.userAccountRepository.findOne({
            where: {
                user_id: userId,
                account_id: accountId,
            },
            relations: ['role'],
        });
        if (!userAccount || !userAccount.role) {
            return null;
        }
        return userAccount.role.name;
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.PermissionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.RoleEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_account_entity_1.UserAccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionService);
