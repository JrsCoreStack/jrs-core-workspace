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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionEntity = void 0;
const typeorm_1 = require("typeorm");
const role_permission_entity_1 = require("src/modules/role_permission/entities/role_permission.entity");
const permission_enum_1 = require("src/utils/enums/permission.enum");
let PermissionEntity = class PermissionEntity {
    id;
    name;
    description;
    module;
    created_at;
    role_permissions;
};
exports.PermissionEntity = PermissionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PermissionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", typeof (_a = typeof permission_enum_1.Permission !== "undefined" && permission_enum_1.Permission) === "function" ? _a : Object)
], PermissionEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], PermissionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'module',
        type: 'varchar',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], PermissionEntity.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PermissionEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => role_permission_entity_1.RolePermissionEntity, (rolePermission) => rolePermission.permission, { cascade: true }),
    __metadata("design:type", Array)
], PermissionEntity.prototype, "role_permissions", void 0);
exports.PermissionEntity = PermissionEntity = __decorate([
    (0, typeorm_1.Entity)('erp_permissions')
], PermissionEntity);
