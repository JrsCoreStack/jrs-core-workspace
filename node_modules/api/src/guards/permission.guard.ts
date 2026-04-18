import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from 'src/modules/permission/permission.service';
import { Permission } from 'src/utils/enums/permission.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<Permission>(
      'permission',
      context.getHandler(),
    );

    // Se não há permissão requerida, permite acesso
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const accountId = request.current_account_id;

    if (!user || !accountId) {
      throw new ForbiddenException('Usuário ou conta não encontrados');
    }

    const hasPermission = await this.permissionService.hasPermission(
      user.user_id || user.id,
      accountId,
      requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acesso negado. Permissão necessária: ${requiredPermission}`,
      );
    }

    return true;
  }
}
