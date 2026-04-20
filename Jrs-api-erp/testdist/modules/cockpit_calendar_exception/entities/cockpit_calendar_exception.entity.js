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
exports.CockpitCalendarExceptionEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitCalendarExceptionEntity = class CockpitCalendarExceptionEntity {
    id;
    ritual_id;
    occurrence_date;
    exception_type;
    notes;
    created_at;
    updated_at;
};
exports.CockpitCalendarExceptionEntity = CockpitCalendarExceptionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitCalendarExceptionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ritual_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CockpitCalendarExceptionEntity.prototype, "ritual_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'occurrence_date', type: 'date' }),
    __metadata("design:type", String)
], CockpitCalendarExceptionEntity.prototype, "occurrence_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exception_type', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], CockpitCalendarExceptionEntity.prototype, "exception_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CockpitCalendarExceptionEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitCalendarExceptionEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitCalendarExceptionEntity.prototype, "updated_at", void 0);
exports.CockpitCalendarExceptionEntity = CockpitCalendarExceptionEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_calendar_exception')
], CockpitCalendarExceptionEntity);
