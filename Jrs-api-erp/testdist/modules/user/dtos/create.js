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
exports.CreateUserDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const cpf_1 = require("src/utils/validations/cpf");
class CreateUserDTO {
    name;
    cpf;
    email;
    phone;
    password;
    totp_secret;
    is2fa_enabled;
    created_at;
    updated_at;
}
exports.CreateUserDTO = CreateUserDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'João Silva', description: 'Nome completo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678900', description: 'CPF (apenas dígitos)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Validate)(cpf_1.IsCpfValid),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'joao@email.com', description: 'E-mail do usuário' }),
    (0, class_validator_1.IsEmail)({}, { message: 'E-mail inválido' }),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11999999999', description: 'Telefone com DDD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Senha@123',
        description: 'Senha (mín. 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)',
    }),
    (0, class_validator_1.IsStrongPassword)({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, { message: 'A senha não atende todos requisitos de segurança' }),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null, nullable: true }),
    __metadata("design:type", String)
], CreateUserDTO.prototype, "totp_secret", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    __metadata("design:type", Boolean)
], CreateUserDTO.prototype, "is2fa_enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], CreateUserDTO.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], CreateUserDTO.prototype, "updated_at", void 0);
