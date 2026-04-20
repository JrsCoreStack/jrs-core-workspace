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
exports.CreateAccountDTO = void 0;
const class_validator_1 = require("class-validator");
const account_type_enum_1 = require("src/utils/enums/account_type.enum");
const account_level_enum_1 = require("src/utils/enums/account_level.enum");
class CreateAccountDTO {
    name;
    code;
    email;
    type;
    level;
    created_at;
    updated_at;
}
exports.CreateAccountDTO = CreateAccountDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDTO.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, {
        message: 'E-mail inválido',
    }),
    __metadata("design:type", String)
], CreateAccountDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(account_type_enum_1.AccountType),
    __metadata("design:type", typeof (_a = typeof account_type_enum_1.AccountType !== "undefined" && account_type_enum_1.AccountType) === "function" ? _a : Object)
], CreateAccountDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(account_level_enum_1.AccountLevel),
    __metadata("design:type", typeof (_b = typeof account_level_enum_1.AccountLevel !== "undefined" && account_level_enum_1.AccountLevel) === "function" ? _b : Object)
], CreateAccountDTO.prototype, "level", void 0);
