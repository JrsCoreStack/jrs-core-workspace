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
exports.CreateFinancialGatewayFeeRuleDTO = void 0;
const class_validator_1 = require("class-validator");
const financial_card_brand_enum_1 = require("src/utils/enums/financial_card_brand.enum");
class CreateFinancialGatewayFeeRuleDTO {
    account_id;
    gateway;
    payment_method;
    card_brand;
    installments;
    percentage_fee;
    fixed_fee;
    active;
}
exports.CreateFinancialGatewayFeeRuleDTO = CreateFinancialGatewayFeeRuleDTO;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFinancialGatewayFeeRuleDTO.prototype, "account_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialGatewayFeeRuleDTO.prototype, "gateway", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFinancialGatewayFeeRuleDTO.prototype, "payment_method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(financial_card_brand_enum_1.FinancialCardBrand),
    __metadata("design:type", typeof (_a = typeof financial_card_brand_enum_1.FinancialCardBrand !== "undefined" && financial_card_brand_enum_1.FinancialCardBrand) === "function" ? _a : Object)
], CreateFinancialGatewayFeeRuleDTO.prototype, "card_brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateFinancialGatewayFeeRuleDTO.prototype, "installments", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateFinancialGatewayFeeRuleDTO.prototype, "percentage_fee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFinancialGatewayFeeRuleDTO.prototype, "fixed_fee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFinancialGatewayFeeRuleDTO.prototype, "active", void 0);
