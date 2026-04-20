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
exports.CockpitNotificationEntity = void 0;
const typeorm_1 = require("typeorm");
let CockpitNotificationEntity = class CockpitNotificationEntity {
    id;
    title;
    message;
    severity;
    source;
    link_url;
    link_label;
    is_read;
    read_at;
    metadata;
    created_at;
    updated_at;
};
exports.CockpitNotificationEntity = CockpitNotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message', type: 'text' }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'severity', type: 'varchar', length: 16, default: 'info' }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source', type: 'varchar', length: 32, default: 'system' }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'link_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "link_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'link_label', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], CockpitNotificationEntity.prototype, "link_label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CockpitNotificationEntity.prototype, "is_read", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CockpitNotificationEntity.prototype, "read_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb', default: () => "'{}'::jsonb" }),
    __metadata("design:type", Object)
], CockpitNotificationEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CockpitNotificationEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CockpitNotificationEntity.prototype, "updated_at", void 0);
exports.CockpitNotificationEntity = CockpitNotificationEntity = __decorate([
    (0, typeorm_1.Entity)('erp_cockpit_notification')
], CockpitNotificationEntity);
