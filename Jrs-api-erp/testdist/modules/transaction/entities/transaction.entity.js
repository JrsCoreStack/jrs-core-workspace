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
exports.TransactionEntity = void 0;
const bank_entity_1 = require("src/modules/bank/entities/bank.entity");
const event_entity_1 = require("src/modules/event/entities/event.entity");
const statement_organization_entity_1 = require("src/modules/statement_organization/entities/statement_organization.entity");
const statement_producer_entity_1 = require("src/modules/statement_producer/entities/statement_producer.entity");
const typeorm_1 = require("typeorm");
let TransactionEntity = class TransactionEntity {
    id;
    event_id;
    bank_id;
    sale_id;
    payment_method;
    payment_installments;
    payment_id;
    payment_status;
    total;
    created_at;
    updated_at;
    event;
    bank;
    statements_organization;
    statements_producer;
};
exports.TransactionEntity = TransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransactionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'bank_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "bank_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sale_id',
        type: 'integer',
        nullable: false,
    }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "sale_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'varchar',
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_installments',
        type: 'integer',
        nullable: true,
    }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "payment_installments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_id',
        type: 'varchar',
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_status',
        type: 'integer',
        nullable: false,
    }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
    }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.EventEntity, (event) => event.transactions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof event_entity_1.EventEntity !== "undefined" && event_entity_1.EventEntity) === "function" ? _a : Object)
], TransactionEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.BankEntity, (bank) => bank, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'bank_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof bank_entity_1.BankEntity !== "undefined" && bank_entity_1.BankEntity) === "function" ? _b : Object)
], TransactionEntity.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_organization_entity_1.StatementOrganizationEntity, (statement) => statement.transaction, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], TransactionEntity.prototype, "statements_organization", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_producer_entity_1.StatementProducerEntity, (statement) => statement.transaction, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], TransactionEntity.prototype, "statements_producer", void 0);
exports.TransactionEntity = TransactionEntity = __decorate([
    (0, typeorm_1.Entity)('erp_transaction')
], TransactionEntity);
