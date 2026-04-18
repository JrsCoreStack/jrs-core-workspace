"use client"

import { useSession } from "next-auth/react"
import { Permission, UserRole } from "@/models/permission"
import { hasPermission, hasRole, isAdmin } from "@/utils/permissions"
import { useMemo } from "react"

/**
 * Hook para verificar permissões e roles do usuário atual
 */
export function usePermissions() {
  const { data: session } = useSession()

  const permissions = useMemo(() => {
    return session?.permissions || []
  }, [session?.permissions])

  const role = useMemo(() => {
    return session?.role
  }, [session?.role])

  const checkPermission = useMemo(
    () => (required: Permission | Permission[]) => {
      return hasPermission(permissions, required)
    },
    [permissions]
  )

  const checkRole = useMemo(
    () => (required: UserRole | UserRole[]) => {
      return hasRole(role, required)
    },
    [role]
  )

  const userIsAdmin = useMemo(() => {
    return isAdmin(role)
  }, [role])

  return {
    permissions,
    role,
    checkPermission,
    checkRole,
    isAdmin: userIsAdmin,
  }
}
