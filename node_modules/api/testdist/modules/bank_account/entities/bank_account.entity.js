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
exports.BankAccountEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const bank_entity_1 = require("src/modules/bank/entities/bank.entity");
const typeorm_1 = require("typeorm");
let BankAccountEntity = class BankAccountEntity {
    id;
    account_id;
    bank_id;
    created_at;
    updated_at;
    account;
    bank;
};
exports.BankAccountEntity = BankAccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BankAccountEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], BankAccountEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'bank_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], BankAccountEntity.prototype, "bank_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankAccountEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BankAccountEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.bank_accounts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _a : Object)
], BankAccountEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.BankEntity, (bank) => bank.bank_accounts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'bank_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof bank_entity_1.BankEntity !== "undefined" && bank_entity_1.BankEntity) === "function" ? _b : Object)
], BankAccountEntity.prototype, "bank", void 0);
exports.BankAccountEntity = BankAccountEntity = __decorate([
    (0, typeorm_1.Entity)('erp_bank_account')
], BankAccountEntity);
