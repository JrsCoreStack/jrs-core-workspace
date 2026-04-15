import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { FinancialCardBrand } from 'src/utils/enums/financial_card_brand.enum';

export class CreateFinancialGatewayFeeRuleDTO {
  @IsUUID()
  account_id: string;

  @IsString()
  gateway: string;

  @IsString()
  payment_method: string;

  @IsOptional()
  @IsEnum(FinancialCardBrand)
  card_brand?: FinancialCardBrand | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number | null;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage_fee: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixed_fee?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
