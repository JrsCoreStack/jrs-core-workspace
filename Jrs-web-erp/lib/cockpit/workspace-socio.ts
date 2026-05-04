import { Permission, UserRole } from "@/models/permission"
import { isAdmin } from "@/utils/permissions"

/** Normaliza texto da API (maiúsculas, acentos, espaços vs underscore). */
function accessSlug(raw: string | number | null | undefined): string {
  if (raw == null) return ""
  return String(raw)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
}

/** Valores comuns em `Account.level` ou equivalente. */
const SOCIO_LEVEL_SLUGS = new Set([
  "admin",
  "administrator",
  "administrador",
  "owner",
  "socio",
  "proprietario",
  "dono",
  "master",
  "superadmin",
  "super_admin",
  "account_owner",
  "titular",
  "gestor_geral",
  "franqueado",
])

/** Códigos/nomes em `session.role`. */
const SOCIO_ROLE_SLUGS = new Set([
  ...SOCIO_LEVEL_SLUGS,
  UserRole.ADMIN.toLowerCase(),
])

/**
 * Utilizadores com papel de sócio na API podem vir em `Account.level` (admin/owner/socio…)
 * ou só na sessão (`role` / `permissions`). O frontend precisa alinhar os vários formatos.
 */
export function isWorkspaceSocioUser(opts: {
  accountLevel?: string | null | number
  sessionRole?: string | null
  permissions?: string[] | null
}): boolean {
  const levelSlug = accessSlug(opts.accountLevel)
  if (levelSlug && SOCIO_LEVEL_SLUGS.has(levelSlug)) return true

  const roleSlug = accessSlug(opts.sessionRole)
  if (roleSlug && SOCIO_ROLE_SLUGS.has(roleSlug)) return true

  if (isAdmin(opts.sessionRole)) return true

  const perms = opts.permissions ?? []
  if (perms.includes(Permission.ADMIN_ALL)) return true

  return false
}
