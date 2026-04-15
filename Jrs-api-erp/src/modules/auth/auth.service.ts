import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dtos/create';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { UserAccountService } from '../user_account/user_account.service';
import { AccountService } from '../account/account.service';
import { UserService } from '../user/user.service';
import { UserStatus } from 'src/utils/enums/user_status.enum';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAccountService: UserAccountService,
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
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
    // Busca direta em erp_user — o find por relação em user_account pode falhar silenciosamente em alguns cenários TypeORM
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

    // Buscar todas as contas vinculadas ao usuário
    const allUserAccounts = await this.userAccountService.findByUserId(
      userEntity.id,
    );

    if (allUserAccounts.length === 0) {
      throw new HttpException(
        {
          message: 'Usuário sem conta vinculada no sistema',
          code: 4,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Determinar a conta atual (primeira conta por padrão)
    let currentAccount = allUserAccounts[0].account;
    let currentAccountId = allUserAccounts[0].account_id;

    // Se foi passado um current_account_id no DTO, verificar se o usuário tem acesso
    if (data.current_account_id) {
      const requestedAccount = allUserAccounts.find(
        (ua) => ua.account_id === data.current_account_id,
      );
      if (requestedAccount) {
        currentAccount = requestedAccount.account;
        currentAccountId = requestedAccount.account_id;
      }
    }

    // Mapear todas as contas para o formato de retorno
    const accounts = allUserAccounts.map((userAccount) => ({
      id: userAccount.account.id,
      name: userAccount.account.name,
      code: userAccount.account.code,
      email: userAccount.account.email,
      type: userAccount.account.type,
      level: userAccount.account.level,
    }));

    // Buscar role e permissões do usuário na conta atual
    const role = await this.permissionService.getUserRole(
      userEntity.id,
      currentAccountId,
    );
    const permissions = await this.permissionService.getUserPermissions(
      userEntity.id,
      currentAccountId,
    );

    const primaryUserAccount =
      allUserAccounts.find((ua) => ua.account_id === currentAccountId) ??
      allUserAccounts[0];

    const payload = {
      sub: primaryUserAccount.id,
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
    const account = await this.accountService.findById(account_id);
    try {
      const decodedToken = this.jwtService.decode(currentToken) as {
        [key: string]: any;
      };

      if (!decodedToken) {
        throw new UnauthorizedException('Token inválido.');
      }

      const userId = decodedToken.user_id || decodedToken.sub;

      // Verificar se o usuário tem acesso à conta solicitada
      const userAccountForTargetAccount =
        await this.userAccountService.findAll(account_id);
      const hasAccessToAccount = userAccountForTargetAccount.find(
        (ua) => ua.user_id === userId,
      );

      if (!hasAccessToAccount) {
        throw new UnauthorizedException(
          'Usuário não tem acesso à conta solicitada.',
        );
      }

      // Buscar role e permissões do usuário na nova conta
      const role = await this.permissionService.getUserRole(userId, account_id);
      const permissions = await this.permissionService.getUserPermissions(
        userId,
        account_id,
      );

      decodedToken.current_account_id = account_id;

      const { iat, exp, ...payload } = decodedToken;

      if (!payload.user_id) {
        payload.user_id = userId;
      }

      const token = this.jwtService.sign(payload);

      return {
        token,
        account: account,
        role: role || null,
        permissions: permissions || [],
      };
    } catch (error) {
      throw new UnauthorizedException('Erro ao atualizar o token.');
    }
  }
}
