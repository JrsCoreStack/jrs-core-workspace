import { IsOptional, IsUUID, IsEnum, IsString, IsInt, Min, IsDateString, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { FinancialEntryType } from 'src/utils/enums/financial_entry_type.enum';

export class ListFinancialEntriesQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsUUID()
  account_id?: string;

  @IsOptional()
  @IsUUID()
  chart_of_account_id?: string;

  @IsOptional()
  @IsEnum(FinancialEntryType)
  type?: FinancialEntryType;

  @IsOptional()
  @IsString()
  reference_type?: string;

  @IsOptional()
  @IsString()
  reference_id?: string;

  @IsOptional()
  @IsString()
  external_source?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  event_id?: string;

  @IsOptional()
  @IsString()
  event_name?: string;

  @IsOptional()
  @IsString()
  payment_id?: string;

  @IsOptional()
  @IsString()
  order_by?: 'entry_date' | 'created_at' | 'amount' = 'entry_date';

  @IsOptional()
  @IsString()
  order_direction?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  group_by_reference?: boolean = false;
}
