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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducerPayoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const producer_payout_service_1 = require("./producer_payout.service");
const payment_request_dto_1 = require("./dtos/payment-request.dto");
const create_manual_payout_dto_1 = require("./dtos/create-manual-payout.dto");
let ProducerPayoutController = class ProducerPayoutController {
    producerPayoutService;
    constructor(producerPayoutService) {
        this.producerPayoutService = producerPayoutService;
    }
    async getPaymentRequests(account_code, event_id, status, limit, offset) {
        return this.producerPayoutService.fetchPaymentRequests({
            account_code,
            event_id,
            status: status || 'waiting_payment',
            limit: limit ? Number(limit) : 10,
            offset: offset ? Number(offset) : 0,
        });
    }
    async markAsPaid(id, body) {
        await this.producerPayoutService.markAsPaid(Number(id), body.account_code);
        return { message: 'Repasse marcado como pago com sucesso' };
    }
    async createManualPayout(body) {
        return this.producerPayoutService.createManualPayout(body);
    }
};
exports.ProducerPayoutController = ProducerPayoutController;
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Query)('account_code')),
    __param(1, (0, common_1.Query)('event_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ProducerPayoutController.prototype, "getPaymentRequests", null);
__decorate([
    (0, common_1.Put)('requests/:id/mark-as-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_request_dto_1.MarkAsPaidDTO]),
    __metadata("design:returntype", Promise)
], ProducerPayoutController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Post)('manual'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_manual_payout_dto_1.CreateManualPayoutDTO]),
    __metadata("design:returntype", Promise)
], ProducerPayoutController.prototype, "createManualPayout", null);
exports.ProducerPayoutController = ProducerPayoutController = __decorate([
    (0, swagger_1.ApiTags)('Pagamentos a Produtores'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('producer_payout'),
    __metadata("design:paramtypes", [producer_payout_service_1.ProducerPayoutService])
], ProducerPayoutController);
