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
exports.FinancialPostingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_posting_service_1 = require("./financial_posting.service");
const create_ticket_sale_dto_1 = require("./dtos/create-ticket-sale.dto");
let FinancialPostingController = class FinancialPostingController {
    financialPostingService;
    constructor(financialPostingService) {
        this.financialPostingService = financialPostingService;
    }
    async createTicketOnlineSale(data) {
        return this.financialPostingService.createTicketOnlineSale(data);
    }
};
exports.FinancialPostingController = FinancialPostingController;
__decorate([
    (0, common_1.Post)('ticket-online-sale'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_sale_dto_1.CreateTicketSaleDTO]),
    __metadata("design:returntype", Promise)
], FinancialPostingController.prototype, "createTicketOnlineSale", null);
exports.FinancialPostingController = FinancialPostingController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro � Postagens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('financial_posting'),
    __metadata("design:paramtypes", [financial_posting_service_1.FinancialPostingService])
], FinancialPostingController);
