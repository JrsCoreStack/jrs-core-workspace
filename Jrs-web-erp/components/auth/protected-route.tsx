"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Permission, UserRole } from "@/models/permission"
import { hasPermission, hasRole, isAdmin } from "@/utils/permissions"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission | Permission[]
  requiredRole?: UserRole | UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push("/auth")
      return
    }

    if (!session) {
      setIsAuthorized(false)
      return
    }

    // Verificar role se necessário
    if (requiredRole) {
      const hasRequiredRole = hasRole(session.role, requiredRole) || isAdmin(session.role)
      if (!hasRequiredRole) {
        setIsAuthorized(false)
        return
      }
    }

    // Verificar permissão se necessário
    if (requiredPermission && session.permissions) {
      const hasRequiredPermission =
        hasPermission(session.permissions, requiredPermission) || isAdmin(session.role)
      if (!hasRequiredPermission) {
        setIsAuthorized(false)
        return
      }
    }

    setIsAuthorized(true)
  }, [session, status, requiredPermission, requiredRole, router])

  if (status === "loading" || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
