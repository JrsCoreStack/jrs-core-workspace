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
exports.FinancialGatewayFeeRuleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_gateway_fee_rule_service_1 = require("./financial_gateway_fee_rule.service");
const create_1 = require("./dtos/create");
const return_1 = require("./dtos/return");
let FinancialGatewayFeeRuleController = class FinancialGatewayFeeRuleController {
    financialGatewayFeeRuleService;
    constructor(financialGatewayFeeRuleService) {
        this.financialGatewayFeeRuleService = financialGatewayFeeRuleService;
    }
    async create(createFinancialGatewayFeeRule) {
        return this.financialGatewayFeeRuleService.create(createFinancialGatewayFeeRule);
    }
    async findAll() {
        return this.financialGatewayFeeRuleService.findAll();
    }
    async findActive(account_id) {
        const rules = await this.financialGatewayFeeRuleService.findActive(account_id);
        return rules.map((rule) => new return_1.ReturnFinancialGatewayFeeRuleDTO(rule));
    }
    async findFee(account_code, gateway, payment_method, card_brand, installments) {
        // Validar parâmetros obrigatórios básicos
        if (!account_code || !gateway || !payment_method) {
            throw new common_1.BadRequestException('Parâmetros obrigatórios: account_code, gateway, payment_method');
        }
        // Para métodos que não são PIX, card_brand e installments são obrigatórios
        const isPix = payment_method.toUpperCase() === 'PIX';
        if (!isPix) {
            if (!card_brand) {
                throw new common_1.BadRequestException('card_brand é obrigatório para métodos de pagamento que não sejam PIX');
            }
            if (!installments) {
                throw new common_1.BadRequestException('installments é obrigatório para métodos de pagamento que não sejam PIX');
            }
        }
        // Validar installments se fornecido
        let installmentsNumber = null;
        if (installments) {
            installmentsNumber = parseInt(installments, 10);
            if (isNaN(installmentsNumber) || installmentsNumber < 1) {
                throw new common_1.BadRequestException('installments deve ser um número inteiro maior que zero');
            }
        }
        const result = await this.financialGatewayFeeRuleService.findFeeByCriteria(account_code, gateway, payment_method, card_brand || null, installmentsNumber);
        if (!result) {
            throw new common_1.BadRequestException('Regra de taxa não encontrada para os critérios fornecidos.');
        }
        return result;
    }
    async findById(id) {
        return this.financialGatewayFeeRuleService.findById(id);
    }
    async findByAccountId(account_id) {
        return this.financialGatewayFeeRuleService.findByAccountId(account_id);
    }
};
exports.FinancialGatewayFeeRuleController = FinancialGatewayFeeRuleController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_1.CreateFinancialGatewayFeeRuleDTO]),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('account_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('fee'),
    __param(0, (0, common_1.Query)('account_code')),
    __param(1, (0, common_1.Query)('gateway')),
    __param(2, (0, common_1.Query)('payment_method')),
    __param(3, (0, common_1.Query)('card_brand')),
    __param(4, (0, common_1.Query)('installments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "findFee", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('account/:account_id'),
    __param(0, (0, common_1.Param)('account_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialGatewayFeeRuleController.prototype, "findByAccountId", null);
exports.FinancialGatewayFeeRuleController = FinancialGatewayFeeRuleController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro � Taxas Gateway'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('financial_gateway_fee_rules'),
    __metadata("design:paramtypes", [financial_gateway_fee_rule_service_1.FinancialGatewayFeeRuleService])
], FinancialGatewayFeeRuleController);
