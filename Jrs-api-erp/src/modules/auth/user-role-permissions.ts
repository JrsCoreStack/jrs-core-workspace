import { Permission } from 'src/utils/enums/permission.enum';
import { UserRole } from 'src/utils/enums/user_role.enum';

/** Espelho de `roles_and_permissions.seed.ts` para auth sem depender das tabelas `erp_roles`. */
const ROLE_PERMISSION_MAP: Record<UserRole, Permission[]> = {
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

/** Nível da conta virtual exposto ao cockpit (frontend trata MASTER como sócio). */
export function virtualAccountLevelString(
  role: UserRole | null | undefined,
): string {
  const r = role ?? UserRole.ADMIN;
  return r === UserRole.ADMIN ? 'MASTER' : 'OPERATIONAL';
}

export function permissionsForUserRole(
  role: UserRole | null | undefined,
): string[] {
  const r = role ?? UserRole.ADMIN;
  return ROLE_PERMISSION_MAP[r] ?? [];
}
