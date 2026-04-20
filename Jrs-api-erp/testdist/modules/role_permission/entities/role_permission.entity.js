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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionEntity = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("src/modules/role/entities/role.entity");
const permission_entity_1 = require("src/modules/permission/entities/permission.entity");
let RolePermissionEntity = class RolePermissionEntity {
    role_id;
    permission_id;
    role;
    permission;
};
exports.RolePermissionEntity = RolePermissionEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'role_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolePermissionEntity.prototype, "role_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'permission_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolePermissionEntity.prototype, "permission_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.RoleEntity, (role) => role.role_permissions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof role_entity_1.RoleEntity !== "undefined" && role_entity_1.RoleEntity) === "function" ? _a : Object)
], RolePermissionEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.PermissionEntity, (permission) => permission.role_permissions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof permission_entity_1.PermissionEntity !== "undefined" && permission_entity_1.PermissionEntity) === "function" ? _b : Object)
], RolePermissionEntity.prototype, "permission", void 0);
exports.RolePermissionEntity = RolePermissionEntity = __decorate([
    (0, typeorm_1.Entity)('erp_role_permissions')
], RolePermissionEntity);
