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
exports.StatementTypeEntity = void 0;
const statement_organization_entity_1 = require("src/modules/statement_organization/entities/statement_organization.entity");
const statement_producer_entity_1 = require("src/modules/statement_producer/entities/statement_producer.entity");
const typeorm_1 = require("typeorm");
let StatementTypeEntity = class StatementTypeEntity {
    id;
    name;
    description;
    created_at;
    updated_at;
    statements_organization;
    statements_producer;
};
exports.StatementTypeEntity = StatementTypeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StatementTypeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], StatementTypeEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], StatementTypeEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StatementTypeEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StatementTypeEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_organization_entity_1.StatementOrganizationEntity, (statement) => statement.statement_type, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], StatementTypeEntity.prototype, "statements_organization", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => statement_producer_entity_1.StatementProducerEntity, (statement) => statement.statement_type, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], StatementTypeEntity.prototype, "statements_producer", void 0);
exports.StatementTypeEntity = StatementTypeEntity = __decorate([
    (0, typeorm_1.Entity)('erp_statement_type')
], StatementTypeEntity);
