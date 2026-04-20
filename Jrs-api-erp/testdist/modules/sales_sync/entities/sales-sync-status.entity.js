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
exports.SalesSyncStatusEntity = void 0;
const typeorm_1 = require("typeorm");
let SalesSyncStatusEntity = class SalesSyncStatusEntity {
    id;
    sync_type; // Formato: 'PRODUCT_ID_REFERENCE_TYPE' (ex: 'JRS_EXTERNAL_SALES_TICKET_ONLINE_SALE')
    last_synced_id;
    last_synced_date;
    total_synced;
    created_at;
    updated_at;
};
exports.SalesSyncStatusEntity = SalesSyncStatusEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SalesSyncStatusEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sync_type',
        type: 'varchar',
        length: 100,
        unique: true,
    }),
    __metadata("design:type", String)
], SalesSyncStatusEntity.prototype, "sync_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'last_synced_id',
        type: 'bigint',
        nullable: true,
    }),
    __metadata("design:type", Number)
], SalesSyncStatusEntity.prototype, "last_synced_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'last_synced_date',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Date)
], SalesSyncStatusEntity.prototype, "last_synced_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_synced',
        type: 'integer',
        default: 0,
    }),
    __metadata("design:type", Number)
], SalesSyncStatusEntity.prototype, "total_synced", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SalesSyncStatusEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SalesSyncStatusEntity.prototype, "updated_at", void 0);
exports.SalesSyncStatusEntity = SalesSyncStatusEntity = __decorate([
    (0, typeorm_1.Entity)('erp_sales_sync_status')
], SalesSyncStatusEntity);
