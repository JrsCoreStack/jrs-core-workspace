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
exports.EventEntity = void 0;
const account_entity_1 = require("src/modules/account/entities/account.entity");
const statement_organization_entity_1 = require("src/modules/statement_organization/entities/statement_organization.entity");
const transaction_entity_1 = require("src/modules/transaction/entities/transaction.entity");
const typeorm_1 = require("typeorm");
let EventEntity = class EventEntity {
    id;
    id_reference;
    name;
    account_id;
    start_date;
    end_date;
    created_at;
    updated_at;
    account;
    transactions;
    statements;
};
exports.EventEntity = EventEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'id_reference',
        type: 'int',
        nullable: false,
    }),
    __metadata("design:type", Number)
], EventEntity.prototype, "id_reference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], EventEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], EventEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_date',
        type: 'timestamp',
        nullable: false,
    }),
    __metadata("design:type", Date)
], EventEntity.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_date',
        type: 'timestamp',
        nullable: false,
    }),
    __metadata("design:type", Date)
], EventEntity.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EventEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EventEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.AccountEntity, (account) => account.events, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof account_entity_1.AccountEntity !== "undefined" && account_entity_1.AccountEntity) === "function" ? _a : Object)
], EventEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.TransactionEntity, (transaction) => transaction.event, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], EventEntity.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_organization_entity_1.StatementOrganizationEntity, (statement) => statement.event, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], EventEntity.prototype, "statements", void 0);
exports.EventEntity = EventEntity = __decorate([
    (0, typeorm_1.Entity)('erp_event')
], EventEntity);
