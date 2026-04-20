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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialEntryEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const financial_chart_of_accounts_entity_1 = require("src/modules/financial_chart_of_accounts/entities/financial_chart_of_accounts.entity");
const financial_entry_type_enum_1 = require("src/utils/enums/financial_entry_type.enum");
const typeorm_1 = require("typeorm");
let FinancialEntryEntity = class FinancialEntryEntity {
    id;
    account_id;
    chart_of_account_id;
    type;
    amount;
    description;
    reference_id;
    reference_type;
    external_source;
    entry_date;
    payment_method;
    event_name;
    event_id;
    installments;
    card_brand;
    payment_id;
    created_at;
    updated_at;
    account;
    chart_of_account;
};
exports.FinancialEntryEntity = FinancialEntryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'chart_of_account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "chart_of_account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: financial_entry_type_enum_1.FinancialEntryType,
        enumName: 'financial_entry_type_enum',
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof financial_entry_type_enum_1.FinancialEntryType !== "undefined" && financial_entry_type_enum_1.FinancialEntryType) === "function" ? _a : Object)
], FinancialEntryEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: false,
    }),
    __metadata("design:type", Number)
], FinancialEntryEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'varchar',
        length: 500,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reference_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "reference_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reference_type',
        type: 'varchar',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "reference_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'external_source',
        type: 'varchar',
        length: 100,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "external_source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entry_date',
        type: 'timestamp',
        nullable: false,
    }),
    __metadata("design:type", Date)
], FinancialEntryEntity.prototype, "entry_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'varchar',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "event_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'installments',
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], FinancialEntryEntity.prototype, "installments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'card_brand',
        type: 'varchar',
        length: 50,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "card_brand", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialEntryEntity.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FinancialEntryEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FinancialEntryEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.financial_entries, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _b : Object)
], FinancialEntryEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity, (chart_of_account) => chart_of_account.financial_entries, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'chart_of_account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity !== "undefined" && financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity) === "function" ? _c : Object)
], FinancialEntryEntity.prototype, "chart_of_account", void 0);
exports.FinancialEntryEntity = FinancialEntryEntity = __decorate([
    (0, typeorm_1.Entity)('erp_financial_entries'),
    (0, typeorm_1.Index)('IDX_FINANCIAL_ENTRIES_ACCOUNT_ID', ['account_id']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID', ['chart_of_account_id']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_ENTRIES_ENTRY_DATE', ['entry_date']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_ENTRIES_PAYMENT_METHOD', ['payment_method']),
    (0, typeorm_1.Index)('IDX_FINANCIAL_ENTRIES_EVENT_ID', ['event_id'])
], FinancialEntryEntity);
