import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketSaleDTO {
  @IsString()
  account_code: string;

  @IsString()
  external_source: string;

  @IsString()
  reference_id: string;

  @Type(() => Number)
  @IsNumber()
  customer_fee_amount: number;

  @Type(() => Number)
  @IsNumber()
  producer_fee_amount: number;

  @Type(() => Number)
  @IsNumber()
  total_paid_amount: number;

  @Type(() => Number)
  @IsNumber()
  ticket_amount: number;

  @Type(() => Number)
  @IsNumber()
  gateway_fee_amount: number;

  @Type(() => Number)
  @IsNumber()
  spread_customer_fee_amount: number;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  event_name?: string;

  @IsOptional()
  @IsString()
  event_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  installments?: number;

  @IsOptional()
  @IsString()
  card_brand?: string;

  @IsOptional()
  @IsString()
  payment_id?: string;

  @IsOptional()
  @IsDate()
  sale_created_at: Date;
}
