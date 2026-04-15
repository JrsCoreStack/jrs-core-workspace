import { Injectable, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UserService } from '../user/user.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly userService: UserService) {}

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'ERPOTicket', secret);
    const qrCode = await this.generateQrCode(otpauth);
    return { secret, qrCode };
  }

  async generateQrCode(otpauth: string): Promise<string> {
    return qrcode.toDataURL(otpauth);
  }

  async validateAccount({
    code,
    secret,
    email,
  }: {
    code: string;
    secret: string;
    email: string;
  }) {
    const isValid = await this.isCodeValid(code, secret);
    if (isValid) {
      await this.userService.saveTotpSecret(email, secret);
    } else {
      // throw new Error('Código inválido');
      throw new UnauthorizedException('Código inválido.');
    }
  }

  async validateCode(code: string, email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);

    const isValid = await this.isCodeValid(code, user?.totp_secret as string);

    if (isValid) {
      return true;
    } else {
      return false;
    }
  }

  async isCodeValid(code: string, secret: string): Promise<boolean> {
    const isValid = authenticator.check(code, secret);
    if (isValid) {
      return true;
    }
    return false;
  }
}
