import { IsBoolean, IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ChartOfAccountsType } from 'src/utils/enums/chart_of_accounts_type.enum';

export class CreateFinancialChartOfAccountsDTO {
  @IsUUID()
  account_id: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(ChartOfAccountsType)
  type: ChartOfAccountsType;

  @IsOptional()
  @IsUUID()
  parent_id?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
