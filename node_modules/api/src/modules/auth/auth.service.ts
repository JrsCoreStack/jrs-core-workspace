import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dtos/create';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { AccountService } from '../account/account.service';
import { UserService } from '../user/user.service';
import { UserStatus } from 'src/utils/enums/user_status.enum';
import {
  VIRTUAL_COCKPIT_ACCOUNT_ID,
  VIRTUAL_COCKPIT_ACCOUNT_NAME,
} from './virtual-account';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
  ) { }

  /** Evita exceção se o hash no banco estiver corrompido ou em texto plano legado */
  private safeBcryptCompare(plain: string, hash: string): boolean {
    try {
      if (!hash || hash.length < 20) {
        return false;
      }
      return bcryptCompareSync(plain, hash);
    } catch {
      return false;
    }
  }

  async signIn(data: AuthDto) {
    const cpfDigits = data.cpf.replace(/\D/g, '');
    const userEntity = await this.userService.findByCpf(cpfDigits);
    if (
      !userEntity ||
      !this.safeBcryptCompare(data.password, userEntity.password)
    ) {
      throw new HttpException(
        {
          message: 'Usuário ou senha inválidos',
          code: 1,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verificar status do usuário
    if (userEntity.status === UserStatus.INACTIVE) {
      throw new HttpException(
        {
          message: 'Usuário inativo',
          code: 2,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (userEntity.status === UserStatus.BLOCKED) {
      throw new HttpException(
        {
          message: 'Usuário bloqueado',
          code: 3,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Atualizar último login
    await this.userService.updateLastLogin(userEntity.id);

    /* Projeto sem vínculo user↔account: sempre conta virtual. Role/permissões vazios. */
    const currentAccountId = VIRTUAL_COCKPIT_ACCOUNT_ID;
    const currentAccount = {
      id: VIRTUAL_COCKPIT_ACCOUNT_ID,
      name: VIRTUAL_COCKPIT_ACCOUNT_NAME,
    };
    const accounts = [
      {
        id: VIRTUAL_COCKPIT_ACCOUNT_ID,
        name: VIRTUAL_COCKPIT_ACCOUNT_NAME,
        code: '',
        email: '',
        type: 0,
        level: '',
      },
    ];

    const role = null;
    const permissions: string[] = [];

    const payload = {
      sub: userEntity.id,
      cpf: userEntity.cpf,
      current_account_id: currentAccountId,
      user_id: userEntity.id,
    };

    const token = this.jwtService.sign(payload);
    return {
      user: {
        id: userEntity.id,
        name: userEntity.name,
        email: userEntity.email,
        cpf: userEntity.cpf,
      },
      account: {
        id: currentAccount.id,
        name: currentAccount.name,
      },
      accounts: accounts,
      current_account_id: currentAccountId,
      role: role || null,
      permissions: permissions || [],
      token,
      expiresIn: String(process.env.JWT_EXPIRATION_TIME),
    };

  }

  /**
   * Emite novo JWT com `current_account_id` atualizado.
   * Não há `erp_user_account` neste projeto — valida só token + existência da conta em `erp_account`.
   */
  async updateToken(
    currentToken: string,
    account_id: string,
  ): Promise<{
    token: string;
    account: {
      id: string;
      name: string;
    };
    role: string | null;
    permissions: string[];
  }> {
    try {
      const account = await this.accountService.findById(account_id);
      const decodedToken = this.jwtService.decode(currentToken) as {
        [key: string]: unknown;
      } | null;

      if (!decodedToken) {
        throw new UnauthorizedException('Token inválido.');
      }

      const userId = (decodedToken.user_id ?? decodedToken.sub) as string;
      if (!userId) {
        throw new UnauthorizedException('Token inválido.');
      }

      const { iat, exp, ...payload } = decodedToken;
      const nextPayload = {
        ...payload,
        user_id: userId,
        current_account_id: account_id,
      };

      const token = this.jwtService.sign(nextPayload);

      return {
        token,
        account,
        role: null,
        permissions: [],
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Erro ao atualizar o token.');
    }
  }
}
