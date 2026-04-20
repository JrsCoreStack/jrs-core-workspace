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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit_log.entity");
let AuditService = class AuditService {
    auditRepository;
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
    }
    async log(data) {
        try {
            const changedFields = this.getChangedFields(data.old_values, data.new_values);
            const auditLog = this.auditRepository.create({
                table_name: data.table_name,
                record_id: data.record_id,
                operation: data.operation,
                old_values: data.old_values,
                new_values: data.new_values,
                changed_fields: changedFields,
                user_id: data.user_id,
                account_id: data.account_id,
                ip_address: data.ip_address,
                user_agent: data.user_agent,
            });
            await this.auditRepository.save(auditLog);
        }
        catch (error) {
            console.error('Erro ao salvar log de auditoria:', error);
        }
    }
    getChangedFields(old_values, new_values) {
        if (!old_values || !new_values)
            return [];
        const changed = [];
        for (const key in new_values) {
            if (JSON.stringify(old_values[key]) !== JSON.stringify(new_values[key])) {
                changed.push(key);
            }
        }
        return changed;
    }
    async getAuditHistory(tableName, record_id, account_id) {
        return this.auditRepository.find({
            where: {
                table_name: tableName,
                record_id: record_id,
                account_id: account_id,
            },
            order: { timestamp: 'DESC' },
        });
    }
    async getAuditByAccount(account_id, limit = 100, offset = 0) {
        return this.auditRepository.find({
            where: { account_id: account_id },
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getAuditByUser(user_id, account_id, limit = 100, offset = 0) {
        return this.auditRepository.find({
            where: { user_id: user_id, account_id: account_id },
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
