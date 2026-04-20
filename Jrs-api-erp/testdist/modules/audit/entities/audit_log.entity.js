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
exports.AuditLogEntity = void 0;
const typeorm_1 = require("typeorm");
let AuditLogEntity = class AuditLogEntity {
    id;
    table_name;
    record_id;
    operation;
    old_values;
    new_values;
    changed_fields;
    user_id;
    account_id;
    ip_address;
    user_agent;
    timestamp;
};
exports.AuditLogEntity = AuditLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name' }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "table_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'record_id' }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "record_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'old_values', nullable: true }),
    __metadata("design:type", Object)
], AuditLogEntity.prototype, "old_values", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'new_values', nullable: true }),
    __metadata("design:type", Object)
], AuditLogEntity.prototype, "new_values", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, name: 'changed_fields', nullable: true }),
    __metadata("design:type", Array)
], AuditLogEntity.prototype, "changed_fields", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true }),
    __metadata("design:type", String)
], AuditLogEntity.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuditLogEntity.prototype, "timestamp", void 0);
exports.AuditLogEntity = AuditLogEntity = __decorate([
    (0, typeorm_1.Entity)('erp_audit_log')
], AuditLogEntity);
