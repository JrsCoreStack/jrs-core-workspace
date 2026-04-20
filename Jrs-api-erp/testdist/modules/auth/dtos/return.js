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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnAuthDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserInfoDTO {
    id;
    name;
    email;
    totp_secret;
    is2fa_enabled;
    cpf;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-do-usuario' }),
    __metadata("design:type", String)
], UserInfoDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Silva' }),
    __metadata("design:type", String)
], UserInfoDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'joao@email.com' }),
    __metadata("design:type", String)
], UserInfoDTO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null, nullable: true }),
    __metadata("design:type", String)
], UserInfoDTO.prototype, "totp_secret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], UserInfoDTO.prototype, "is2fa_enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678900' }),
    __metadata("design:type", String)
], UserInfoDTO.prototype, "cpf", void 0);
class AccountInfoDTO {
    id;
    name;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-da-conta' }),
    __metadata("design:type", String)
], AccountInfoDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Minha Empresa' }),
    __metadata("design:type", String)
], AccountInfoDTO.prototype, "name", void 0);
class AccountItemDTO {
    id;
    name;
    code;
    email;
    type;
    level;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-da-conta' }),
    __metadata("design:type", String)
], AccountItemDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Minha Empresa' }),
    __metadata("design:type", String)
], AccountItemDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001' }),
    __metadata("design:type", String)
], AccountItemDTO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contato@empresa.com' }),
    __metadata("design:type", String)
], AccountItemDTO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], AccountItemDTO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PREMIUM' }),
    __metadata("design:type", String)
], AccountItemDTO.prototype, "level", void 0);
class ReturnAuthDTO {
    token;
    expiresIn;
    user;
    account;
    accounts;
    current_account_id;
    role;
    permissions;
}
exports.ReturnAuthDTO = ReturnAuthDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGci...' }),
    __metadata("design:type", String)
], ReturnAuthDTO.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '7d' }),
    __metadata("design:type", String)
], ReturnAuthDTO.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserInfoDTO }),
    __metadata("design:type", UserInfoDTO)
], ReturnAuthDTO.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AccountInfoDTO }),
    __metadata("design:type", AccountInfoDTO)
], ReturnAuthDTO.prototype, "account", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [AccountItemDTO] }),
    __metadata("design:type", Array)
], ReturnAuthDTO.prototype, "accounts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-da-conta', nullable: true }),
    __metadata("design:type", String)
], ReturnAuthDTO.prototype, "current_account_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ADMIN', nullable: true }),
    __metadata("design:type", String)
], ReturnAuthDTO.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['read:users', 'write:users'] }),
    __metadata("design:type", Array)
], ReturnAuthDTO.prototype, "permissions", void 0);
