import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStatementOrganizationDTO {
  @IsString()
  @IsUUID()
  transaction_id: string;
  @IsUUID()
  account_id: string;
  @IsUUID()
  event_id: string;
  @IsUUID()
  statement_type_id: string;
  @IsOptional()
  @IsString()
  type: string;
  @IsNumber()
  amount: number;
  created_at: Date;
  updated_at: Date;
}
