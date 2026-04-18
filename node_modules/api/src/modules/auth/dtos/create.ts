import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, Validate, IsOptional } from 'class-validator';
import { IsCpfValid } from 'src/utils/validations/cpf';

export class AuthDto {
  @ApiProperty({
    example: '12345678900',
    description: 'CPF do usuário (apenas dígitos)',
  })
  @IsString()
  @Validate(IsCpfValid)
  cpf: string;

  @ApiProperty({ example: 'Senha@123', description: 'Senha do usuário' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: 'uuid-da-conta',
    description: 'ID da conta ativa (opcional)',
  })
  @IsUUID()
  @IsOptional()
  current_account_id?: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'Código 2FA (opcional)',
  })
  @IsString()
  @IsOptional()
  code?: string;
}
