import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthDto } from './dtos/create';
import { ReturnAuthDTO } from './dtos/return';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com CPF e senha' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: ReturnAuthDTO })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 403, description: 'Usuário bloqueado ou inativo' })
  async signIn(@Body() data: AuthDto) {
    return await this.authService.signIn(data);
  }

  @Post('token/update')
  @ApiOperation({ summary: 'Trocar conta ativa no token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'account_id'],
      properties: {
        token: { type: 'string', example: 'eyJhbGci...' },
        account_id: { type: 'string', format: 'uuid', example: 'uuid-da-conta' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Novo token emitido com a conta selecionada',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        role: { type: 'string', nullable: true },
        permissions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async updateToken(
    @Body('token') token: string,
    @Body('account_id') account_id: string,
  ): Promise<{
    token: string;
    account: { id: string; name: string };
    role: string | null;
    permissions: string[];
  }> {
    const newToken = await this.authService.updateToken(token, account_id);
    return {
      token: newToken.token,
      account: {
        id: newToken.account.id,
        name: newToken.account.name,
      },
      role: newToken.role,
      permissions: newToken.permissions,
    };
  }
}
