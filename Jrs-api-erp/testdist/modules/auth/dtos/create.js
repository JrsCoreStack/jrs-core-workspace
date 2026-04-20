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
exports.AuthDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const cpf_1 = require("src/utils/validations/cpf");
class AuthDto {
    cpf;
    password;
    current_account_id;
    code;
}
exports.AuthDto = AuthDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '12345678900',
        description: 'CPF do usuário (apenas dígitos)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Validate)(cpf_1.IsCpfValid),
    __metadata("design:type", String)
], AuthDto.prototype, "cpf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senha@123', description: 'Senha do usuário' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'uuid-da-conta',
        description: 'ID da conta ativa (opcional)',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthDto.prototype, "current_account_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123456',
        description: 'Código 2FA (opcional)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthDto.prototype, "code", void 0);
