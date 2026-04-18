import { DataSource } from 'typeorm';
import { FinancialGatewayFeeRuleEntity } from 'src/modules/financial_gateway_fee_rule/entities/financial_gateway_fee_rule.entity';
import { FinancialCardBrand } from 'src/utils/enums/financial_card_brand.enum';

export async function seedFinancialGatewayFeeRules(
  dataSource: DataSource,
  account_id: string,
) {
  const repository =
    dataSource.getRepository(FinancialGatewayFeeRuleEntity);

  // Deleta regras existentes para este account_id e gateway PICPAY
  await repository.delete({
    account_id,
    gateway: 'PICPAY',
  });

  const rules: Partial<FinancialGatewayFeeRuleEntity>[] = [];

  // ===== CRÉDITO MASTERCARD PARCELADO (1-12x) =====
  const mastercardFees = [
    { installments: 1, fee: 2.05 },
    { installments: 2, fee: 3.17 },
    { installments: 3, fee: 3.83 },
    { installments: 4, fee: 4.43 },
    { installments: 5, fee: 5.13 },
    { installments: 6, fee: 5.73 },
    { installments: 7, fee: 6.73 },
    { installments: 8, fee: 7.33 },
    { installments: 9, fee: 8.03 },
    { installments: 10, fee: 8.73 },
    { installments: 11, fee: 9.43 },
    { installments: 12, fee: 10.13 },
  ];

  for (const { installments, fee } of mastercardFees) {
    rules.push({
      account_id,
      gateway: 'PICPAY',
      payment_method: 'CREDIT',
      card_brand: FinancialCardBrand.MASTERCARD,
      installments,
      percentage_fee: fee,
      fixed_fee: 0,
      active: true,
    });
  }

  // ===== PIX =====
  rules.push({
    account_id,
    gateway: 'PICPAY',
    payment_method: 'PIX',
    card_brand: null,
    installments: null,
    percentage_fee: 0.27,
    fixed_fee: 0,
    active: true,
  });

  // Salva todas as regras
  for (const rule of rules) {
    await repository.save(repository.create(rule));
  }


}
