import { FinancialAccountEntity } from '../entities/financial_account.entity';
import { FinancialAccountType } from 'src/utils/enums/financial_account_type.enum';

export class ReturnFinancialAccountDTO {
  id: string;
  account_id: string;
  name: string;
  type: FinancialAccountType;
  currency: string;
  initial_balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;

  constructor(financialAccountEntity: FinancialAccountEntity) {
    this.id = financialAccountEntity.id;
    this.account_id = financialAccountEntity.account_id;
    this.name = financialAccountEntity.name;
    this.type = financialAccountEntity.type;
    this.currency = financialAccountEntity.currency;
    this.initial_balance = financialAccountEntity.initial_balance;
    this.active = financialAccountEntity.active;
    this.created_at = String(financialAccountEntity.created_at);
    this.updated_at = String(financialAccountEntity.updated_at);
  }
}
