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
exports.UserEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_account_entity_1 = require("src/modules/user_account/entities/user_account.entity");
const user_status_enum_1 = require("src/utils/enums/user_status.enum");
const typeorm_1 = require("typeorm");
let UserEntity = class UserEntity {
    id;
    name;
    cpf;
    email;
    phone;
    password;
    totp_secret;
    is2fa_enabled;
    last_login;
    status;
    created_at;
    updated_at;
    user_accounts;
};
exports.UserEntity = UserEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-do-usuario', description: 'ID único do usuário' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Silva' }),
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678900', description: 'CPF (apenas dígitos)' }),
    (0, typeorm_1.Column)({ name: 'cpf', type: 'varchar', length: 11, nullable: false, unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'joao@email.com' }),
    (0, typeorm_1.Column)({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11999999999' }),
    (0, typeorm_1.Column)({ name: 'phone', type: 'varchar', length: 15, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '$2b$10$...', description: 'Hash bcrypt da senha' }),
    (0, typeorm_1.Column)({ name: 'password', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null, nullable: true }),
    (0, typeorm_1.Column)({ name: 'totp_secret', type: 'varchar', length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], UserEntity.prototype, "totp_secret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, typeorm_1.Column)({ name: 'is2fa_enabled', type: 'boolean', default: false, nullable: false }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is2fa_enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null, nullable: true }),
    (0, typeorm_1.Column)({ name: 'last_login', type: 'timestamp', nullable: true, default: null }),
    __metadata("design:type", Date)
], UserEntity.prototype, "last_login", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_status_enum_1.UserStatus, example: user_status_enum_1.UserStatus.ACTIVE }),
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: user_status_enum_1.UserStatus, enumName: 'user_status_enum', nullable: false, default: user_status_enum_1.UserStatus.ACTIVE }),
    __metadata("design:type", typeof (_a = typeof user_status_enum_1.UserStatus !== "undefined" && user_status_enum_1.UserStatus) === "function" ? _a : Object)
], UserEntity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserEntity.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_account_entity_1.UserAccountEntity, (user_account) => user_account.user),
    __metadata("design:type", Array)
], UserEntity.prototype, "user_accounts", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)('erp_user')
], UserEntity);
