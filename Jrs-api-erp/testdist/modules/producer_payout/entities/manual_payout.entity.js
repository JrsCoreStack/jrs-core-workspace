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
exports.ManualPayoutEntity = void 0;
const typeorm_1 = require("typeorm");
const account_entity_1 = require("../../account/entities/account.entity");
const financial_entry_entity_1 = require("../../financial_entry/entities/financial_entry.entity");
let ManualPayoutEntity = class ManualPayoutEntity {
    id;
    account_id;
    event_id;
    event_name;
    amount;
    description;
    financial_entry_id;
    payment_receiver;
    payment_key;
    created_at;
    updated_at;
    account;
    financial_entry;
};
exports.ManualPayoutEntity = ManualPayoutEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "event_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], ManualPayoutEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'financial_entry_id',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "financial_entry_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_receiver',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "payment_receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_key',
        type: 'varchar',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], ManualPayoutEntity.prototype, "payment_key", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], ManualPayoutEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], ManualPayoutEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", account_entity_1.AccountEntity)
], ManualPayoutEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => financial_entry_entity_1.FinancialEntryEntity),
    (0, typeorm_1.JoinColumn)({ name: 'financial_entry_id' }),
    __metadata("design:type", financial_entry_entity_1.FinancialEntryEntity)
], ManualPayoutEntity.prototype, "financial_entry", void 0);
exports.ManualPayoutEntity = ManualPayoutEntity = __decorate([
    (0, typeorm_1.Entity)('erp_financial_payouts'),
    (0, typeorm_1.Index)('IDX_FINANCIAL_PAYOUTS_ACCOUNT_ID', ['account_id']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_PAYOUTS_EVENT_ID', ['event_id']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_PAYOUTS_FINANCIAL_ENTRY_ID', ['financial_entry_id'])
], ManualPayoutEntity);
