import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccountEntity } from '../modules/user_account/entities/user_account.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const accountId = request.current_account_id;

    if (!user || !accountId) {
      throw new ForbiddenException('Usuário ou conta não encontrados');
    }

    // Buscar o role do usuário na conta específica
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        user_id: user.user_id,
        account_id: accountId,
      },
    });

    if (!userAccount) {
      throw new ForbiddenException('Usuário não possui acesso a esta conta');
    }

    // Verificar se o role do usuário está na lista de roles permitidos
    // const hasRole = requiredRoles.includes(userAccount.role);

    // if (!hasRole) {
    //   throw new ForbiddenException(
    //     `Acesso negado. Roles necessários: ${requiredRoles.join(', ')}. Role atual: ${userAccount.role}`,
    //   );
    // }

    return true;
  }
}
