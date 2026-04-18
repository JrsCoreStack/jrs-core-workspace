import { Permission, UserRole } from "@/models/permission"

/**
 * Verifica se o usuário tem uma ou mais permissões
 */
export function hasPermission(
  userPermissions: string[],
  required: Permission | Permission[]
): boolean {
  // Se tiver admin:all, tem acesso a tudo
  if (userPermissions.includes(Permission.ADMIN_ALL)) {
    return true
  }

  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((p) => userPermissions.includes(p))
}

/**
 * Verifica se o usuário tem um role específico
 */
export function hasRole(userRole: string | undefined, required: UserRole | UserRole[]): boolean {
  if (!userRole) return false

  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((r) => userRole === r)
}

/**
 * Verifica se o usuário é admin
 */
export function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, UserRole.ADMIN)
}

/**
 * Verifica se o usuário tem acesso ao módulo financeiro
 */
export function canAccessFinancial(userRole: string | undefined): boolean {
  return isAdmin(userRole) || hasRole(userRole, UserRole.FINANCIAL)
}

/**
 * Verifica se o usuário tem acesso ao módulo comercial
 */
export function canAccessCommercial(userRole: string | undefined): boolean {
  return (
    isAdmin(userRole) ||
    hasRole(userRole, [UserRole.COMMERCIAL, UserRole.COMMERCIAL_MANAGER])
  )
}

/**
 * Verifica se o usuário pode gerenciar equipe comercial
 */
export function canManageCommercialTeam(userRole: string | undefined): boolean {
  return isAdmin(userRole) || hasRole(userRole, UserRole.COMMERCIAL_MANAGER)
}
