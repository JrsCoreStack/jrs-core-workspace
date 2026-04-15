import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateManualPayoutDTO {
  @IsString()
  account_code: string;

  @IsString()
  event_id: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  payment_receiver?: string;

  @IsOptional()
  @IsString()
  payment_key?: string;
}
