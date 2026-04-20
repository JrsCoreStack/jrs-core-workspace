"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const permission_entity_1 = require("./entities/permission.entity");
const permission_service_1 = require("./permission.service");
const permission_controller_1 = require("./permission.controller");
const role_module_1 = require("../role/role.module");
const role_entity_1 = require("../role/entities/role.entity");
const user_account_entity_1 = require("../user_account/entities/user_account.entity");
const role_permission_entity_1 = require("../role_permission/entities/role_permission.entity");
const permission_guard_1 = require("src/guards/permission.guard");
const auth_module_1 = require("../auth/auth.module");
let PermissionModule = class PermissionModule {
};
exports.PermissionModule = PermissionModule;
exports.PermissionModule = PermissionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                permission_entity_1.PermissionEntity,
                role_entity_1.RoleEntity,
                user_account_entity_1.UserAccountEntity,
                role_permission_entity_1.RolePermissionEntity,
            ]),
            (0, common_1.forwardRef)(() => role_module_1.RoleModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [permission_controller_1.PermissionController],
        providers: [permission_service_1.PermissionService, permission_guard_1.PermissionGuard],
        exports: [permission_service_1.PermissionService, permission_guard_1.PermissionGuard],
    })
], PermissionModule);
