import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserInfoDTO {
  @ApiProperty({ example: 'uuid-do-usuario' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  totp_secret?: string | null;

  @ApiProperty({ example: false })
  is2fa_enabled?: boolean;

  @ApiProperty({ example: '12345678900' })
  cpf: string;
}

class AccountInfoDTO {
  @ApiProperty({ example: 'uuid-da-conta' })
  id: string;

  @ApiProperty({ example: 'Minha Empresa' })
  name: string;
}

class AccountItemDTO {
  @ApiProperty({ example: 'uuid-da-conta' })
  id: string;

  @ApiProperty({ example: 'Minha Empresa' })
  name: string;

  @ApiProperty({ example: 'EMP001' })
  code: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  email: string;

  @ApiProperty({ example: 1 })
  type: number;

  @ApiProperty({ example: 'PREMIUM' })
  level: string;
}

export class ReturnAuthDTO {
  @ApiProperty({ example: 'eyJhbGci...' })
  token: string;

  @ApiProperty({ example: '7d' })
  expiresIn: string;

  @ApiProperty({ type: UserInfoDTO })
  user: UserInfoDTO;

  @ApiProperty({ type: AccountInfoDTO })
  account: AccountInfoDTO;

  @ApiPropertyOptional({ type: [AccountItemDTO] })
  accounts?: AccountItemDTO[];

  @ApiPropertyOptional({ example: 'uuid-da-conta', nullable: true })
  current_account_id?: string | null;

  @ApiPropertyOptional({ example: 'ADMIN', nullable: true })
  role: string | null;

  @ApiProperty({ example: ['read:users', 'write:users'] })
  permissions: string[];
}
