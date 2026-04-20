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
exports.CreateFinancialAccountDTO = void 0;
const class_validator_1 = require("class-validator");
const financial_account_type_enum_1 = require("src/utils/enums/financial_account_type.enum");
class CreateFinancialAccountDTO {
    account_id;
    name;
    type;
    currency;
    initial_balance;
    active;
}
exports.CreateFinancialAccountDTO = CreateFinancialAccountDTO;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFinancialAccountDTO.prototype, "account_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialAccountDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(financial_account_type_enum_1.FinancialAccountType),
    __metadata("design:type", typeof (_a = typeof financial_account_type_enum_1.FinancialAccountType !== "undefined" && financial_account_type_enum_1.FinancialAccountType) === "function" ? _a : Object)
], CreateFinancialAccountDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialAccountDTO.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFinancialAccountDTO.prototype, "initial_balance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFinancialAccountDTO.prototype, "active", void 0);
