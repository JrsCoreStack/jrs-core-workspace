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
exports.BankEntity = void 0;
const bank_account_entity_1 = require("src/modules/bank_account/entities/bank_account.entity");
const typeorm_1 = require("typeorm");
let BankEntity = class BankEntity {
    id;
    name;
    created_at;
    updated_at;
    bank_accounts;
};
exports.BankEntity = BankEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BankEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], BankEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BankEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bank_account_entity_1.BankAccountEntity, (bank_account) => bank_account.account, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], BankEntity.prototype, "bank_accounts", void 0);
exports.BankEntity = BankEntity = __decorate([
    (0, typeorm_1.Entity)('erp_bank')
], BankEntity);
