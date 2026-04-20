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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementOrganizationEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const event_entity_1 = require("src/modules/event/entities/event.entity");
const statement_type_entity_1 = require("src/modules/statement_type/entities/statement_type.entity");
const transaction_entity_1 = require("src/modules/transaction/entities/transaction.entity");
const typeorm_1 = require("typeorm");
let StatementOrganizationEntity = class StatementOrganizationEntity {
    id;
    transaction_id;
    account_id;
    event_id;
    statement_type_id;
    amount;
    type;
    created_at;
    updated_at;
    transaction;
    event;
    statement_type;
    account;
};
exports.StatementOrganizationEntity = StatementOrganizationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'transaction_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'statement_type_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "statement_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
    }),
    __metadata("design:type", Number)
], StatementOrganizationEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'varchar',
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], StatementOrganizationEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StatementOrganizationEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StatementOrganizationEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.TransactionEntity, (transaction) => transaction.statements_organization, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'transaction_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof transaction_entity_1.TransactionEntity !== "undefined" && transaction_entity_1.TransactionEntity) === "function" ? _a : Object)
], StatementOrganizationEntity.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.EventEntity, (event) => event.statements, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof event_entity_1.EventEntity !== "undefined" && event_entity_1.EventEntity) === "function" ? _b : Object)
], StatementOrganizationEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => statement_type_entity_1.StatementTypeEntity, (statementType) => statementType.statements_organization, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'statement_type_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof statement_type_entity_1.StatementTypeEntity !== "undefined" && statement_type_entity_1.StatementTypeEntity) === "function" ? _c : Object)
], StatementOrganizationEntity.prototype, "statement_type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.statements, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_d = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _d : Object)
], StatementOrganizationEntity.prototype, "account", void 0);
exports.StatementOrganizationEntity = StatementOrganizationEntity = __decorate([
    (0, typeorm_1.Entity)('erp_statement_organization')
], StatementOrganizationEntity);
