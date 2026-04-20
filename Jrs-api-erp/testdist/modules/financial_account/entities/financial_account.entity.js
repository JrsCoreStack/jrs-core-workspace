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
exports.FinancialAccountEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const financial_account_type_enum_1 = require("src/utils/enums/financial_account_type.enum");
const typeorm_1 = require("typeorm");
let FinancialAccountEntity = class FinancialAccountEntity {
    id;
    account_id;
    name;
    type;
    currency;
    initial_balance;
    active;
    created_at;
    updated_at;
    account;
};
exports.FinancialAccountEntity = FinancialAccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FinancialAccountEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialAccountEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialAccountEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: financial_account_type_enum_1.FinancialAccountType,
        enumName: 'financial_account_type_enum',
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof financial_account_type_enum_1.FinancialAccountType !== "undefined" && financial_account_type_enum_1.FinancialAccountType) === "function" ? _a : Object)
], FinancialAccountEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'currency',
        type: 'char',
        length: 3,
        nullable: false,
        default: 'BRL',
    }),
    __metadata("design:type", String)
], FinancialAccountEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'initial_balance',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], FinancialAccountEntity.prototype, "initial_balance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'active',
        type: 'boolean',
        nullable: false,
        default: true,
    }),
    __metadata("design:type", Boolean)
], FinancialAccountEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FinancialAccountEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FinancialAccountEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.financial_accounts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _b : Object)
], FinancialAccountEntity.prototype, "account", void 0);
exports.FinancialAccountEntity = FinancialAccountEntity = __decorate([
    (0, typeorm_1.Entity)('erp_financial_accounts')
], FinancialAccountEntity);
