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
exports.RoleEntity = void 0;
const typeorm_1 = require("typeorm");
const role_permission_entity_1 = require("src/modules/role_permission/entities/role_permission.entity");
const user_role_enum_1 = require("src/utils/enums/user_role.enum");
let RoleEntity = class RoleEntity {
    id;
    name;
    description;
    created_at;
    role_permissions;
};
exports.RoleEntity = RoleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'enum',
        enum: user_role_enum_1.UserRole,
        enumName: 'user_role_enum',
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", typeof (_a = typeof user_role_enum_1.UserRole !== "undefined" && user_role_enum_1.UserRole) === "function" ? _a : Object)
], RoleEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], RoleEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RoleEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => role_permission_entity_1.RolePermissionEntity, (rolePermission) => rolePermission.role, { cascade: true }),
    __metadata("design:type", Array)
], RoleEntity.prototype, "role_permissions", void 0);
exports.RoleEntity = RoleEntity = __decorate([
    (0, typeorm_1.Entity)('erp_roles')
], RoleEntity);
