import { IsBoolean, IsEnum, IsOptional, IsUUID, IsString, IsNumber, IsDate } from 'class-validator';
import { ExternalSource } from 'src/utils/enums/external_source.enum';
import { FinancialEntryType } from 'src/utils/enums/financial_entry_type.enum';

export class CreateFinancialEntryDTO {
  @IsUUID()
  account_id: string;

  @IsUUID()
  chart_of_account_id: string;

  @IsEnum(FinancialEntryType)
  type: FinancialEntryType;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  reference_id: string | null;

  @IsString()
  @IsOptional()
  reference_type: string | null;

  @IsString()
  external_source: string;

  @IsDate()
  entry_date: Date;

}
