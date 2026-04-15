import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserAccountDTO {
  @IsString()
  @IsUUID()
  user_id: string;
  @IsString()
  @IsUUID()
  account_id: string;
  @IsOptional()
  @IsString()
  @IsUUID()
  role_id?: string;
  created_at: Date;
  updated_at: Date;
}
