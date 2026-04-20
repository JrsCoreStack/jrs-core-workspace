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
exports.CockpitRitualEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitRitualEntity = class CockpitRitualEntity {
    id;
    name;
    area;
    freq;
    owner_name;
    schedule;
    duration_min;
    kpi_count;
    tracked_sessions;
    total_sessions;
    tracking_label;
    next_label;
    participants;
    extra_participants;
    is_active;
    last_not_tracked_date;
    created_at;
    updated_at;
};
exports.CockpitRitualEntity = CockpitRitualEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'freq', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "freq", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'schedule', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_min', type: 'int', default: 60 }),
    __metadata("design:type", Number)
], CockpitRitualEntity.prototype, "duration_min", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpi_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CockpitRitualEntity.prototype, "kpi_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tracked_sessions', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CockpitRitualEntity.prototype, "tracked_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_sessions', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CockpitRitualEntity.prototype, "total_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tracking_label', type: 'varchar', length: 64, default: 'rastreadas' }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "tracking_label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_label', type: 'varchar', length: 255, default: '—' }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "next_label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'participants', type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], CockpitRitualEntity.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extra_participants', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CockpitRitualEntity.prototype, "extra_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CockpitRitualEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_not_tracked_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], CockpitRitualEntity.prototype, "last_not_tracked_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitRitualEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitRitualEntity.prototype, "updated_at", void 0);
exports.CockpitRitualEntity = CockpitRitualEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_ritual')
], CockpitRitualEntity);
