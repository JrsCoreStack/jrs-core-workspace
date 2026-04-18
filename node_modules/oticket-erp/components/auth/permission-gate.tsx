"use client"

import * as React from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission, UserRole } from "@/models/permission"

interface PermissionGateProps {
  children: React.ReactNode
  requiredPermission?: Permission | Permission[]
  requiredRole?: UserRole | UserRole[]
  fallback?: React.ReactNode
}

/**
 * Componente para mostrar/ocultar elementos baseado em permissões ou roles
 */
export function PermissionGate({
  children,
  requiredPermission,
  requiredRole,
  fallback = null,
}: PermissionGateProps) {
  const { checkPermission, checkRole, isAdmin } = usePermissions()

  // Se for admin, sempre mostra
  if (isAdmin) {
    return <>{children}</>
  }

  // Verificar role se necessário
  if (requiredRole) {
    if (!checkRole(requiredRole)) {
      return <>{fallback}</>
    }
  }

  // Verificar permissão se necessário
  if (requiredPermission) {
    if (!checkPermission(requiredPermission)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
