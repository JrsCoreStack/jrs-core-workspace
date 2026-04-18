import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { UserAccountEntity } from 'src/modules/user_account/entities/user_account.entity';
import { Permission } from 'src/utils/enums/permission.enum';
import { UserRole } from 'src/utils/enums/user_role.enum';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
  ) {}

  /**
   * Verifica se um usuário tem uma permissão específica em uma conta
   */
  async hasPermission(
    userId: string,
    accountId: string,
    permission: Permission,
  ): Promise<boolean> {
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        user_id: userId,
        account_id: accountId,
      },
      relations: ['role'],
    });

    if (!userAccount || !userAccount.role_id || !userAccount.role) {
      return false;
    }

    // ADMIN tem todas as permissões
    if (userAccount.role.name === UserRole.ADMIN) {
      return true;
    }

    // Verificar se o role tem a permissão
    const role = await this.roleRepository.findOne({
      where: { id: userAccount.role_id },
      relations: ['role_permissions', 'role_permissions.permission'],
    });

    if (!role) {
      return false;
    }

    return role.role_permissions.some(
      (rp) => rp.permission.name === permission,
    );
  }

  /**
   * Retorna todas as permissões de um usuário em uma conta
   */
  async getUserPermissions(
    userId: string,
    accountId: string,
  ): Promise<Permission[]> {
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        user_id: userId,
        account_id: accountId,
      },
      relations: ['role'],
    });

    if (!userAccount || !userAccount.role) {
      return [];
    }

    // ADMIN tem todas as permissões
    if (userAccount.role.name === UserRole.ADMIN) {
      return Object.values(Permission);
    }

    // Buscar permissões do role
    const role = await this.roleRepository.findOne({
      where: { id: userAccount.role_id },
      relations: ['role_permissions', 'role_permissions.permission'],
    });

    if (!role) {
      return [];
    }

    return role.role_permissions.map((rp) => rp.permission.name);
  }

  /**
   * Verifica se um usuário tem um role específico em uma conta
   */
  async hasRole(
    userId: string,
    accountId: string,
    role: UserRole,
  ): Promise<boolean> {
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        user_id: userId,
        account_id: accountId,
      },
      relations: ['role'],
    });

    if (!userAccount || !userAccount.role) {
      return false;
    }

    return userAccount.role.name === role;
  }

  /**
   * Retorna o role de um usuário em uma conta
   */
  async getUserRole(
    userId: string,
    accountId: string,
  ): Promise<UserRole | null> {
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        user_id: userId,
        account_id: accountId,
      },
      relations: ['role'],
    });

    if (!userAccount || !userAccount.role) {
      return null;
    }

    return userAccount.role.name;
  }
}
