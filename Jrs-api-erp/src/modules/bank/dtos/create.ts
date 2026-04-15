import { IsString } from 'class-validator';

export class CreateBankDTO {
  @IsString()
  name: string;
  created_at: Date;
  updated_at: Date;
}
