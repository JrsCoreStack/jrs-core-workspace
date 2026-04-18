import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';
import { IsEmail, IsString, IsStrongPassword, Validate } from 'class-validator';
import { IsCpfValid } from 'src/utils/validations/cpf';

export class CreateUserDTO {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12345678900', description: 'CPF (apenas dígitos)' })
  @IsString()
  @Validate(IsCpfValid)
  cpf: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do usuário' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: '11999999999', description: 'Telefone com DDD' })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Senha (mín. 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)',
  })
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

  @ApiPropertyOptional({ example: null, nullable: true })
  totp_secret: string | null;

  @ApiPropertyOptional({ example: false })
  is2fa_enabled: boolean;

  @ApiPropertyOptional()
  created_at: Date;

  @ApiPropertyOptional()
  updated_at: Date;
}
