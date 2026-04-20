import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { TwoFactorService } from './two_factor.service';
import { ReturnAuthDTO } from '../auth/dtos/return';

@ApiExcludeController()
@ApiTags('Autenticaÿÿo 2FA')
@ApiBearerAuth()
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('generate')
  async generate(
    @Body('email') email: string,
  ): Promise<{ secret: string; qrCode: string }> {
    return this.twoFactorService.generateSecret(email);
  }

  // 2. Valida??o do primeiro c?digo e ativa??o
  @Post('activate')
  async activate(
    @Body('code') code: string,
    @Body('secret') secret: string,
    @Body('email') email: string,
  ): Promise<void> {
    return this.twoFactorService.validateAccount({
      code,
      secret,
      email,
    });
  }

  @Post('validate')
  async validate(
    @Body('code') code: string,
    @Body('email') email: string,
  ): Promise<boolean> {
    return this.twoFactorService.validateCode(code, email);
  }
}
