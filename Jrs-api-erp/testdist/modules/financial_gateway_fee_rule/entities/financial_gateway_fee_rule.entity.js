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
exports.FinancialGatewayFeeRuleEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const financial_card_brand_enum_1 = require("src/utils/enums/financial_card_brand.enum");
const typeorm_1 = require("typeorm");
let FinancialGatewayFeeRuleEntity = class FinancialGatewayFeeRuleEntity {
    id;
    account_id;
    gateway;
    payment_method;
    card_brand;
    installments;
    percentage_fee;
    fixed_fee;
    active;
    created_at;
    account;
};
exports.FinancialGatewayFeeRuleEntity = FinancialGatewayFeeRuleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FinancialGatewayFeeRuleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialGatewayFeeRuleEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'gateway',
        type: 'varchar',
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialGatewayFeeRuleEntity.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'varchar',
        length: 20,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialGatewayFeeRuleEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'card_brand',
        type: 'enum',
        enum: financial_card_brand_enum_1.FinancialCardBrand,
        enumName: 'financial_card_brand_enum',
        nullable: true,
    }),
    __metadata("design:type", typeof (_a = typeof financial_card_brand_enum_1.FinancialCardBrand !== "undefined" && financial_card_brand_enum_1.FinancialCardBrand) === "function" ? _a : Object)
], FinancialGatewayFeeRuleEntity.prototype, "card_brand", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'installments',
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], FinancialGatewayFeeRuleEntity.prototype, "installments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'percentage_fee',
        type: 'decimal',
        precision: 6,
        scale: 4,
        nullable: false,
    }),
    __metadata("design:type", Number)
], FinancialGatewayFeeRuleEntity.prototype, "percentage_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fixed_fee',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], FinancialGatewayFeeRuleEntity.prototype, "fixed_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'active',
        type: 'boolean',
        nullable: false,
        default: true,
    }),
    __metadata("design:type", Boolean)
], FinancialGatewayFeeRuleEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FinancialGatewayFeeRuleEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _b : Object)
], FinancialGatewayFeeRuleEntity.prototype, "account", void 0);
exports.FinancialGatewayFeeRuleEntity = FinancialGatewayFeeRuleEntity = __decorate([
    (0, typeorm_1.Entity)('erp_financial_gateway_fee_rules')
], FinancialGatewayFeeRuleEntity);
