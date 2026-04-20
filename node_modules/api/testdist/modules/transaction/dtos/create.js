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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionDTO = void 0;
const class_validator_1 = require("class-validator");
const payment_method_1 = require("src/utils/enums/payment_method");
const transaction_status_1 = require("src/utils/enums/transaction_status");
class CreateTransactionDTO {
    event_id;
    bank_id;
    sale_id;
    payment_method;
    payment_installments;
    payment_id;
    payment_status;
    total;
    created_at;
    updated_at;
}
exports.CreateTransactionDTO = CreateTransactionDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDTO.prototype, "event_id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDTO.prototype, "bank_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionDTO.prototype, "sale_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(payment_method_1.PaymentMethod),
    __metadata("design:type", typeof (_a = typeof payment_method_1.PaymentMethod !== "undefined" && payment_method_1.PaymentMethod) === "function" ? _a : Object)
], CreateTransactionDTO.prototype, "payment_method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionDTO.prototype, "payment_installments", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDTO.prototype, "payment_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(transaction_status_1.TransactionStatus),
    __metadata("design:type", typeof (_b = typeof transaction_status_1.TransactionStatus !== "undefined" && transaction_status_1.TransactionStatus) === "function" ? _b : Object)
], CreateTransactionDTO.prototype, "payment_status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionDTO.prototype, "total", void 0);
