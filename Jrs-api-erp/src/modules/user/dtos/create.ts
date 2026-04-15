import { Optional } from '@nestjs/common';
import { IsEmail, IsString, IsStrongPassword, Validate } from 'class-validator';
import { IsCpfValid } from 'src/utils/validations/cpf';

export class CreateUserDTO {
  @IsString()
  name: string;
  @IsString()
  @Validate(IsCpfValid)
  cpf: string;
  @IsEmail(
    {},
    {
      message: 'E-mail inválido',
    },
  )
  email: string;
  @IsString()
  phone: string;
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'A senha não atende todos requisitos de segurança' },
  )
  password: string;
  totp_secret: string | null;
  is2fa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
