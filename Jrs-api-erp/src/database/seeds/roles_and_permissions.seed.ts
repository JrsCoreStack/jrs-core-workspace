import { DataSource } from 'typeorm';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { RolePermissionEntity } from 'src/modules/role_permission/entities/role_permission.entity';
import { UserRole } from 'src/utils/enums/user_role.enum';
import { Permission } from 'src/utils/enums/permission.enum';

export async function seedRolesAndPermissions(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(RoleEntity);
  const permissionRepository = dataSource.getRepository(PermissionEntity);
  const rolePermissionRepository =
    dataSource.getRepository(RolePermissionEntity);

  // Limpar dados existentes
  await rolePermissionRepository.delete({});
  await permissionRepository.delete({});
  await roleRepository.delete({});

  // Criar Permissões
  const permissions = [
    // ADMIN
    {
      name: Permission.ADMIN_ALL,
      description: 'Acesso total ao sistema',
      module: 'ADMIN',
    },
    // FINANCIAL
    {
      name: Permission.FINANCIAL_VIEW_REPORTS,
      description: 'Visualizar relatórios financeiros',
      module: 'FINANCIAL',
    },
    {
      name: Permission.FINANCIAL_VIEW_ALL_TRANSACTIONS,
      description: 'Visualizar todas as transações financeiras',
      module: 'FINANCIAL',
    },
    {
      name: Permission.FINANCIAL_MANAGE_ACCOUNTS_PAYABLE,
      description: 'Gerenciar contas a pagar',
      module: 'FINANCIAL',
    },
    {
      name: Permission.FINANCIAL_MANAGE_ACCOUNTS_RECEIVABLE,
      description: 'Gerenciar contas a receber',
      module: 'FINANCIAL',
    },
    {
      name: Permission.FINANCIAL_MANAGE_CHART_OF_ACCOUNTS,
      description: 'Gerenciar plano de contas',
      module: 'FINANCIAL',
    },
    {
      name: Permission.FINANCIAL_EXPORT_DATA,
      description: 'Exportar dados financeiros',
      module: 'FINANCIAL',
    },
    // COMMERCIAL
    {
      name: Permission.COMMERCIAL_VIEW_OWN_COMMISSION,
      description: 'Visualizar própria comissão',
      module: 'COMMERCIAL',
    },
    {
      name: Permission.COMMERCIAL_VIEW_OWN_SALES,
      description: 'Visualizar próprias vendas',
      module: 'COMMERCIAL',
    },
    {
      name: Permission.COMMERCIAL_MANAGE_OWN_CLIENTS,
      description: 'Gerenciar próprios clientes',
      module: 'COMMERCIAL',
    },
    // COMMERCIAL_MANAGER
    {
      name: Permission.COMMERCIAL_MANAGER_VIEW_ALL_COMMISSIONS,
      description: 'Visualizar todas as comissões',
      module: 'COMMERCIAL_MANAGER',
    },
    {
      name: Permission.COMMERCIAL_MANAGER_VIEW_ALL_SALES,
      description: 'Visualizar todas as vendas',
      module: 'COMMERCIAL_MANAGER',
    },
    {
      name: Permission.COMMERCIAL_MANAGER_MANAGE_ALL_CLIENTS,
      description: 'Gerenciar todos os clientes',
      module: 'COMMERCIAL_MANAGER',
    },
    {
      name: Permission.COMMERCIAL_MANAGER_MANAGE_TEAM,
      description: 'Gerenciar equipe comercial',
      module: 'COMMERCIAL_MANAGER',
    },
  ];

  const createdPermissions = await permissionRepository.save(
    permissions.map((p) => permissionRepository.create(p)),
  );


  // Criar Roles
  const roles = [
    {
      name: UserRole.ADMIN,
      description: 'Administrador com acesso total ao sistema',
    },
    {
      name: UserRole.FINANCIAL,
      description: 'Usuário do setor financeiro',
    },
    {
      name: UserRole.COMMERCIAL_MANAGER,
      description: 'Gestor comercial com acesso a toda equipe',
    },
    {
      name: UserRole.COMMERCIAL,
      description: 'Comercial com acesso apenas aos próprios dados',
    },
  ];

  const createdRoles = await roleRepository.save(
    roles.map((r) => roleRepository.create(r)),
  );


  // Mapear permissões para roles
  const rolePermissionMap: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [Permission.ADMIN_ALL],
    [UserRole.FINANCIAL]: [
      Permission.FINANCIAL_VIEW_REPORTS,
      Permission.FINANCIAL_VIEW_ALL_TRANSACTIONS,
      Permission.FINANCIAL_MANAGE_ACCOUNTS_PAYABLE,
      Permission.FINANCIAL_MANAGE_ACCOUNTS_RECEIVABLE,
      Permission.FINANCIAL_MANAGE_CHART_OF_ACCOUNTS,
      Permission.FINANCIAL_EXPORT_DATA,
    ],
    [UserRole.COMMERCIAL_MANAGER]: [
      Permission.COMMERCIAL_VIEW_OWN_COMMISSION,
      Permission.COMMERCIAL_VIEW_OWN_SALES,
      Permission.COMMERCIAL_MANAGE_OWN_CLIENTS,
      Permission.COMMERCIAL_MANAGER_VIEW_ALL_COMMISSIONS,
      Permission.COMMERCIAL_MANAGER_VIEW_ALL_SALES,
      Permission.COMMERCIAL_MANAGER_MANAGE_ALL_CLIENTS,
      Permission.COMMERCIAL_MANAGER_MANAGE_TEAM,
    ],
    [UserRole.COMMERCIAL]: [
      Permission.COMMERCIAL_VIEW_OWN_COMMISSION,
      Permission.COMMERCIAL_VIEW_OWN_SALES,
      Permission.COMMERCIAL_MANAGE_OWN_CLIENTS,
    ],
  };

  // Criar relacionamentos Role x Permission
  const rolePermissions: RolePermissionEntity[] = [];

  for (const role of createdRoles) {
    const permissionsForRole = rolePermissionMap[role.name as UserRole] || [];
    const permissionEntities = createdPermissions.filter((p) =>
      permissionsForRole.includes(p.name),
    );

    for (const permission of permissionEntities) {
      const rolePermission = rolePermissionRepository.create({
        role_id: role.id,
        permission_id: permission.id,
      });
      rolePermissions.push(rolePermission);
    }
  }

  await rolePermissionRepository.save(rolePermissions);



  // Log detalhado
  for (const role of createdRoles) {
    const permissionsForRole = rolePermissionMap[role.name as UserRole] || [];

  }

  return {
    roles: createdRoles,
    permissions: createdPermissions,
  };
}
