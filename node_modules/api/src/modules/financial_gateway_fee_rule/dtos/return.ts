import { FinancialGatewayFeeRuleEntity } from '../entities/financial_gateway_fee_rule.entity';
import { FinancialCardBrand } from 'src/utils/enums/financial_card_brand.enum';

export class ReturnFinancialGatewayFeeRuleDTO {
  id: string;
  account_id: string;
  gateway: string;
  payment_method: string;
  card_brand: FinancialCardBrand | null;
  installments: number | null;
  percentage_fee: number;
  fixed_fee: number;
  active: boolean;
  created_at: string;

  constructor(financialGatewayFeeRuleEntity: FinancialGatewayFeeRuleEntity) {
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
