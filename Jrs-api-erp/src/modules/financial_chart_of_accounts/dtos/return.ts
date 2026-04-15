import { FinancialChartOfAccountsEntity } from '../entities/financial_chart_of_accounts.entity';
import { ChartOfAccountsType } from 'src/utils/enums/chart_of_accounts_type.enum';

export class ReturnFinancialChartOfAccountsDTO {
  id: string;
  account_id: string;
  code: string;
  name: string;
  type: ChartOfAccountsType;
  parent_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;

  constructor(chartOfAccountsEntity: FinancialChartOfAccountsEntity) {
    this.id = chartOfAccountsEntity.id;
    this.account_id = chartOfAccountsEntity.account_id;
    this.code = chartOfAccountsEntity.code;
    this.name = chartOfAccountsEntity.name;
    this.type = chartOfAccountsEntity.type;
    this.parent_id = chartOfAccountsEntity.parent_id;
    this.active = chartOfAccountsEntity.active;
    this.created_at = String(chartOfAccountsEntity.created_at);
    this.updated_at = String(chartOfAccountsEntity.updated_at);
  }
}
