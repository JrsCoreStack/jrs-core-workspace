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
exports.CockpitKpiGoalVersionEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitKpiGoalVersionEntity = class CockpitKpiGoalVersionEntity {
    id;
    kpi_id;
    month_goal;
    annual_goal;
    note;
    changed_by;
    changed_at;
    created_at;
    updated_at;
};
exports.CockpitKpiGoalVersionEntity = CockpitKpiGoalVersionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitKpiGoalVersionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpi_id', type: 'uuid' }),
    __metadata("design:type", String)
], CockpitKpiGoalVersionEntity.prototype, "kpi_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'month_goal', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiGoalVersionEntity.prototype, "month_goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_goal', type: 'numeric', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CockpitKpiGoalVersionEntity.prototype, "annual_goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiGoalVersionEntity.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], CockpitKpiGoalVersionEntity.prototype, "changed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], CockpitKpiGoalVersionEntity.prototype, "changed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitKpiGoalVersionEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitKpiGoalVersionEntity.prototype, "updated_at", void 0);
exports.CockpitKpiGoalVersionEntity = CockpitKpiGoalVersionEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_kpi_goal_version')
], CockpitKpiGoalVersionEntity);
