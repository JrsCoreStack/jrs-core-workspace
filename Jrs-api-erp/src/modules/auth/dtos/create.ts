import { IsString, IsUUID, Validate, IsOptional } from 'class-validator';
import { IsCpfValid } from 'src/utils/validations/cpf';

export class AuthDto {
  @IsString()
  @Validate(IsCpfValid)
  cpf: string;
  @IsString()
  password: string;
  @IsUUID()
  @IsOptional()
  current_account_id?: string;
  @IsString()
  @IsOptional()
  code?: string;
}
