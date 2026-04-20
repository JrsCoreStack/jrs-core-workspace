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
exports.AccountEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
const bank_account_entity_1 = require("src/modules/bank_account/entities/bank_account.entity");
const financial_chart_of_accounts_entity_1 = require("src/modules/financial_chart_of_accounts/entities/financial_chart_of_accounts.entity");
const event_entity_1 = require("src/modules/event/entities/event.entity");
const financial_account_entity_1 = require("src/modules/financial_account/entities/financial_account.entity");
const financial_entry_entity_1 = require("src/modules/financial_entry/entities/financial_entry.entity");
const statement_organization_entity_1 = require("src/modules/statement_organization/entities/statement_organization.entity");
const user_account_entity_1 = require("src/modules/user_account/entities/user_account.entity");
const typeorm_1 = require("typeorm");
const account_level_enum_1 = require("src/utils/enums/account_level.enum");
let AccountEntity = class AccountEntity {
    id;
    name;
    code;
    email;
    type;
    level;
    created_at;
    updated_at;
    user_accounts;
    events;
    statements;
    bank_accounts;
    chart_of_accounts;
    financial_accounts;
    financial_entries;
};
exports.AccountEntity = AccountEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-da-conta' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AccountEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Empresa XYZ' }),
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], AccountEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001', description: 'Código da conta' }),
    (0, typeorm_1.Column)({ name: 'code', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], AccountEntity.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contato@empresa.com' }),
    (0, typeorm_1.Column)({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true }),
    __metadata("design:type", String)
], AccountEntity.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Tipo numérico único da conta' }),
    (0, typeorm_1.Column)({ name: 'type', type: 'int', nullable: false, unique: true }),
    __metadata("design:type", Number)
], AccountEntity.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: account_level_enum_1.AccountLevel, example: account_level_enum_1.AccountLevel.OPERATIONAL }),
    (0, typeorm_1.Column)({ name: 'level', type: 'enum', enum: account_level_enum_1.AccountLevel, enumName: 'account_level_enum', nullable: false, default: account_level_enum_1.AccountLevel.OPERATIONAL }),
    __metadata("design:type", typeof (_a = typeof account_level_enum_1.AccountLevel !== "undefined" && account_level_enum_1.AccountLevel) === "function" ? _a : Object)
], AccountEntity.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AccountEntity.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AccountEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_account_entity_1.UserAccountEntity, (user_account) => user_account.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "user_accounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_entity_1.EventEntity, (event) => event.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_organization_entity_1.StatementOrganizationEntity, (statement) => statement.event, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "statements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bank_account_entity_1.BankAccountEntity, (bank_account) => bank_account.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "bank_accounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => financial_chart_of_accounts_entity_1.FinancialChartOfAccountsEntity, (chart_of_accounts) => chart_of_accounts.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "chart_of_accounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => financial_account_entity_1.FinancialAccountEntity, (financial_account) => financial_account.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "financial_accounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => financial_entry_entity_1.FinancialEntryEntity, (financial_entry) => financial_entry.account, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], AccountEntity.prototype, "financial_entries", void 0);
exports.AccountEntity = AccountEntity = __decorate([
    (0, typeorm_1.Entity)('erp_account')
], AccountEntity);
