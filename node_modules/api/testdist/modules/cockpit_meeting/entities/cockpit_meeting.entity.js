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
exports.CockpitMeetingEntity = void 0;
const typeorm_1 = require("typeorm");
const cockpit_ritual_entity_1 = require("src/modules/cockpit_ritual/entities/cockpit_ritual.entity");
let CockpitMeetingEntity = class CockpitMeetingEntity {
    id;
    ritual_id;
    ritual;
    occurred_at;
    duration_min;
    state;
    ata;
    /** Pauta fixa + itens de checklist com dono e status */
    agenda_items;
    /** Participantes (opcional: user_id do ERP) + presença */
    meeting_participants;
    ata_template_id;
    created_at;
    updated_at;
};
exports.CockpitMeetingEntity = CockpitMeetingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitMeetingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ritual_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitMeetingEntity.prototype, "ritual_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cockpit_ritual_entity_1.CockpitRitualEntity, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'ritual_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof cockpit_ritual_entity_1.CockpitRitualEntity !== "undefined" && cockpit_ritual_entity_1.CockpitRitualEntity) === "function" ? _a : Object)
], CockpitMeetingEntity.prototype, "ritual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], CockpitMeetingEntity.prototype, "occurred_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_min', type: 'int', default: 60 }),
    __metadata("design:type", Number)
], CockpitMeetingEntity.prototype, "duration_min", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state', type: 'varchar', length: 32, default: 'done' }),
    __metadata("design:type", String)
], CockpitMeetingEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CockpitMeetingEntity.prototype, "ata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agenda_items', type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], CockpitMeetingEntity.prototype, "agenda_items", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meeting_participants', type: 'jsonb', default: () => "'[]'::jsonb" }),
    __metadata("design:type", Array)
], CockpitMeetingEntity.prototype, "meeting_participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ata_template_id', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], CockpitMeetingEntity.prototype, "ata_template_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitMeetingEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitMeetingEntity.prototype, "updated_at", void 0);
exports.CockpitMeetingEntity = CockpitMeetingEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_meeting')
], CockpitMeetingEntity);
