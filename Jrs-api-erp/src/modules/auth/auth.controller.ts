import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthDto } from './dtos/create';
import { ReturnAuthDTO } from './dtos/return';
import { AuthService } from './auth.service';
import { ReturnAccountDTO } from '../account/dtos/return';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() data: AuthDto) {
    return await this.authService.signIn(data);
  }

  @Post('token/update')
  async updateToken(
    @Body('token') token: string,
    @Body('account_id') account_id: string,
  ): Promise<{
    token: string;
    account: {
      id: string;
      name: string;
    };
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
