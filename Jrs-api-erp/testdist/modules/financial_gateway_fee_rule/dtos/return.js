"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnFinancialGatewayFeeRuleDTO = void 0;
class ReturnFinancialGatewayFeeRuleDTO {
    id;
    account_id;
    gateway;
    payment_method;
    card_brand;
    installments;
    percentage_fee;
    fixed_fee;
    active;
    created_at;
    constructor(financialGatewayFeeRuleEntity) {
        this.id = financialGatewayFeeRuleEntity.id;
        this.account_id = financialGatewayFeeRuleEntity.account_id;
        this.gateway = financialGatewayFeeRuleEntity.gateway;
        this.payment_method = financialGatewayFeeRuleEntity.payment_method;
        this.card_brand = financialGatewayFeeRuleEntity.card_brand;
        this.installments = financialGatewayFeeRuleEntity.installments;
        this.percentage_fee = Number(financialGatewayFeeRuleEntity.percentage_fee);
        this.fixed_fee = Number(financialGatewayFeeRuleEntity.fixed_fee);
        this.active = financialGatewayFeeRuleEntity.active;
        this.created_at = String(financialGatewayFeeRuleEntity.created_at);
    }
}
exports.ReturnFinancialGatewayFeeRuleDTO = ReturnFinancialGatewayFeeRuleDTO;
