/**
 * Utilitário para formatar nomes de roles para português brasileiro
 */

export function formatRoleName(role: string | undefined | null): string {
  if (!role) {
    return "Sem perfil"
  }

  const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    OWNER: "Proprietário",
    FINANCIAL: "Financeiro",
    COMMERCIAL: "Comercial",
    COMMERCIAL_MANAGER: "Gerente Comercial",
  }

  return roleMap[role] || role
}
