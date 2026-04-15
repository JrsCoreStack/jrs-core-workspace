import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dtos/create';
import { ReturnAuthDTO } from './dtos/return';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { UserAccountService } from '../user_account/user_account.service';
import { AccountService } from '../account/account.service';
import { TwoFactorService } from '../two_factor/two_factor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAccountService: UserAccountService,
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async signIn(data: AuthDto) {
    const user = await this.userAccountService.findByCpf(
      data.cpf.replace(/\D/g, ''),
    );
    if (!user || !bcryptCompareSync(data.password, user.user.password)) {
      throw new HttpException(
        {
          message: 'Usuário ou senha inválidos',
          code: 1,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.user.is2fa_enabled === false) {
      const secret = await this.twoFactorService.generateSecret(
        user.user.email,
      );

      throw new HttpException(
        {
          message: '2FA obrigatório. Ative o autenticador',
          code: 2,
          secret: secret.secret,
          qrcode: secret.qrCode,
          email: user.user.email,
        },
        HttpStatus.UNAUTHORIZED,
      );
    } else if (user.user.is2fa_enabled === true && !data.code) {
      throw new HttpException(
        {
          message: 'Informe o código do autenticador',
          code: 3,
          email: user.user.email,
        },
        HttpStatus.UNAUTHORIZED,
      );
    } else if (user.user.is2fa_enabled === true && data.code) {
      const isValid = await this.twoFactorService.isCodeValid(
        data.code,
        user?.user?.totp_secret as string,
      );

      if (isValid) {
        const payload = {
          sub: user?.id,
          cpf: user?.user.cpf,
          current_account_id: user?.account_id,
          user_id: user?.user.id,
        };

        const token = this.jwtService.sign(payload);
        return {
          user: {
            id: user.user.id,
            name: user.user.name,
            email: user.user.email,
            cpf: user.user.cpf,
          },
          account: {
            id: user.account.id,
            name: user.account.name,
          },
          current_account_id: user.account_id,
          token,
          expiresIn: String(process.env.JWT_EXPIRATION_TIME),
        };
      } else {
        throw new UnauthorizedException('Código do autenticador inválido.');
      }
    }
  }

  async updateToken(
    currentToken: string,
    account_id: string,
  ): Promise<{
    token: string;
    account: {
      id: string;
      name: string;
    };
    // role: string;
  }> {
    const account = await this.accountService.findById(account_id);
    try {
      const decodedToken = this.jwtService.decode(currentToken) as {
        [key: string]: any;
      };

      if (!decodedToken) {
        throw new UnauthorizedException('Token inválido.');
      }

      // Buscar o userAccount para obter o role
      const userAccount = await this.userAccountService.findById(
        decodedToken.sub,
      );

      // Verificar se o usuário tem acesso à conta solicitada
      const userAccountForTargetAccount =
        await this.userAccountService.findAll(account_id);
      const hasAccessToAccount = userAccountForTargetAccount.find(
        (ua) => ua.user_id === userAccount.user_id,
      );

      if (!hasAccessToAccount) {
        throw new UnauthorizedException(
          'Usuário não tem acesso à conta solicitada.',
        );
      }

      decodedToken.current_account_id = account_id;

      const { iat, exp, ...payload } = decodedToken;

      if (!payload.user_id && userAccount) {
        payload.user_id = userAccount.user_id;
      }

      const token = this.jwtService.sign(payload);

      return {
        token,
        account: account,
        // role: hasAccessToAccount.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Erro ao atualizar o token.');
    }
  }
}
