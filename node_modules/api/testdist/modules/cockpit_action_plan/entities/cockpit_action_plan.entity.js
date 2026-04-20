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
exports.CockpitActionPlanEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitActionPlanEntity = class CockpitActionPlanEntity {
    id;
    title;
    description;
    status;
    area;
    owner_name;
    due_date;
    priority;
    ritual_id;
    meeting_id;
    depends_on_plan_id;
    comments;
    history;
    is_active;
    created_at;
    updated_at;
};
exports.CockpitActionPlanEntity = CockpitActionPlanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date' }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "due_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', type: 'varchar', length: 16, default: 'medium' }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ritual_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "ritual_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "meeting_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depends_on_plan_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitActionPlanEntity.prototype, "depends_on_plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments', type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], CockpitActionPlanEntity.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'history', type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], CockpitActionPlanEntity.prototype, "history", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CockpitActionPlanEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitActionPlanEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitActionPlanEntity.prototype, "updated_at", void 0);
exports.CockpitActionPlanEntity = CockpitActionPlanEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_action_plan')
], CockpitActionPlanEntity);
