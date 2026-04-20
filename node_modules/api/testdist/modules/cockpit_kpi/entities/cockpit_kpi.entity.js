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
exports.CockpitKpiEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitKpiEntity = class CockpitKpiEntity {
    id;
    name;
    metric;
    code_ref;
    unit;
    area;
    kpi_type;
    aggregation;
    input_frequency;
    owner_name;
    owner_role;
    is_cockpit;
    /** Desvio % vs meta mês abaixo de -threshold = status crítico (ex.: 15 → crítico se &lt; -15%). */
    critical_deviation_threshold_pct;
    /** Limite positivo em % para a faixa de atenção (deve ser ≤ crítico; ex.: 5 → desvio entre -5% e 0% = atenção “leve”). */
    attention_deviation_threshold_pct;
    month_goal;
    annual_goal;
    current_value;
    stale_periods;
    ritual_id;
    meeting_id;
    is_active;
    created_at;
    updated_at;
};
exports.CockpitKpiEntity = CockpitKpiEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metric', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "metric", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_ref', type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "code_ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', type: 'varchar', length: 32, default: '' }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpi_type', type: 'varchar', length: 32, default: 'Monetário' }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "kpi_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aggregation', type: 'varchar', length: 32, default: 'Soma' }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "aggregation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'input_frequency', type: 'varchar', length: 32, default: 'Semanal' }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "input_frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', type: 'varchar', length: 255, default: '' }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_role', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "owner_role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_cockpit', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CockpitKpiEntity.prototype, "is_cockpit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'critical_deviation_threshold_pct', type: 'numeric', precision: 10, scale: 4, default: 15 }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "critical_deviation_threshold_pct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attention_deviation_threshold_pct', type: 'numeric', precision: 10, scale: 4, default: 5 }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "attention_deviation_threshold_pct", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'month_goal', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "month_goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_goal', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "annual_goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_value', type: 'numeric', precision: 18, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "current_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stale_periods', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiEntity.prototype, "stale_periods", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ritual_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "ritual_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitKpiEntity.prototype, "meeting_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CockpitKpiEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitKpiEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitKpiEntity.prototype, "updated_at", void 0);
exports.CockpitKpiEntity = CockpitKpiEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_kpi')
], CockpitKpiEntity);
