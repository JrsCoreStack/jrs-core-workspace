import { IsString, IsUUID } from 'class-validator';

export class CreateBankAccountDTO {
  @IsUUID()
  account_id: string;
  @IsUUID()
  bank_id: string;
  created_at: Date;
  updated_at: Date;
}
