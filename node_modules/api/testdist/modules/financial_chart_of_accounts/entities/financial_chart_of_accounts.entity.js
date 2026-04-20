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
exports.FinancialChartOfAccountsEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const financial_entry_entity_1 = require("src/modules/financial_entry/entities/financial_entry.entity");
const chart_of_accounts_type_enum_1 = require("src/utils/enums/chart_of_accounts_type.enum");
const typeorm_1 = require("typeorm");
let FinancialChartOfAccountsEntity = class FinancialChartOfAccountsEntity {
    id;
    account_id;
    code;
    name;
    type;
    parent_id;
    active;
    created_at;
    updated_at;
    account;
    parent;
    children;
    financial_entries;
};
exports.FinancialChartOfAccountsEntity = FinancialChartOfAccountsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FinancialChartOfAccountsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialChartOfAccountsEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'code',
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialChartOfAccountsEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], FinancialChartOfAccountsEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: chart_of_accounts_type_enum_1.ChartOfAccountsType,
        enumName: 'chart_of_accounts_type_enum',
        nullable: false,
    }),
    __metadata("design:type", typeof (_a = typeof chart_of_accounts_type_enum_1.ChartOfAccountsType !== "undefined" && chart_of_accounts_type_enum_1.ChartOfAccountsType) === "function" ? _a : Object)
], FinancialChartOfAccountsEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'parent_id',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], FinancialChartOfAccountsEntity.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'active',
        type: 'boolean',
        nullable: false,
        default: true,
    }),
    __metadata("design:type", Boolean)
], FinancialChartOfAccountsEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FinancialChartOfAccountsEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FinancialChartOfAccountsEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.chart_of_accounts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _b : Object)
], FinancialChartOfAccountsEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FinancialChartOfAccountsEntity, (parent) => parent.children, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id', referencedColumnName: 'id' }),
    __metadata("design:type", FinancialChartOfAccountsEntity)
], FinancialChartOfAccountsEntity.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FinancialChartOfAccountsEntity, (child) => child.parent, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], FinancialChartOfAccountsEntity.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => financial_entry_entity_1.FinancialEntryEntity, (financial_entry) => financial_entry.chart_of_account, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], FinancialChartOfAccountsEntity.prototype, "financial_entries", void 0);
exports.FinancialChartOfAccountsEntity = FinancialChartOfAccountsEntity = __decorate([
    (0, typeorm_1.Entity)('erp_financial_chart_of_accounts')
], FinancialChartOfAccountsEntity);
