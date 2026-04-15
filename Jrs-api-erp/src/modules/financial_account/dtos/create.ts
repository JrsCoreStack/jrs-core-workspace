import { IsBoolean, IsEnum, IsOptional, IsUUID, IsString, IsNumber } from 'class-validator';
import { ChartOfAccountsType } from 'src/utils/enums/chart_of_accounts_type.enum';
import { FinancialAccountType } from 'src/utils/enums/financial_account_type.enum';

export class CreateFinancialAccountDTO {
  @IsUUID()
  account_id: string;

  @IsString()
  name: string;

  @IsEnum(FinancialAccountType)
  type: FinancialAccountType;

  @IsString()
  currency: string;

  @IsNumber()
  initial_balance: number;

  @IsOptional()
  @IsBoolean()
  active: boolean

}
