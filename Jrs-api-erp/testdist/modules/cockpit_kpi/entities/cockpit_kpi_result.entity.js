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
exports.CockpitKpiResultEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitKpiResultEntity = class CockpitKpiResultEntity {
    id;
    kpi_id;
    period_label;
    period_start;
    value;
    target;
    deviation_pct;
    evidence_url;
    evidence_note;
    /** Caminho relativo em disco (uploads/cockpit-kpi-evidence/...) */
    evidence_file_key;
    evidence_file_name;
    created_at;
    updated_at;
    deleted_at;
    deleted_by_user_id;
    /** Snapshot do nome no momento da exclusão (auditoria). */
    deleted_by_name;
};
exports.CockpitKpiResultEntity = CockpitKpiResultEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpi_id', type: 'uuid' }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "kpi_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_label', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "period_label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_start', type: 'date', nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "period_start", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiResultEntity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiResultEntity.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deviation_pct', type: 'numeric', precision: 10, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiResultEntity.prototype, "deviation_pct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_url', type: 'varchar', length: 2048, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "evidence_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_note', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "evidence_note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_file_key', type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "evidence_file_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_file_name', type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "evidence_file_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitKpiResultEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitKpiResultEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CockpitKpiResultEntity.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_by_user_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "deleted_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_by_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiResultEntity.prototype, "deleted_by_name", void 0);
exports.CockpitKpiResultEntity = CockpitKpiResultEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_kpi_result')
], CockpitKpiResultEntity);
