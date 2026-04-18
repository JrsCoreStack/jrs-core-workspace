"use client"

import { useAuthService } from "@/hooks/use-auth-service"
import { Role } from "@/models/permission"
import { useCallback } from "react"

/**
 * Hook para operações de Roles em Client Components
 */
export const useRoleService = () => {
  const { authenticatedRequest } = useAuthService()

  /**
   * Lista todos os roles disponíveis
   */
  const LIST_ALL = useCallback(
    async (): Promise<Role[] | undefined> => {
      try {
        return await authenticatedRequest<Role[]>("get", "/role")
      } catch (error) {
        console.error("List all roles error:", error)
        throw error
      }
    },
    [authenticatedRequest]
  )

  /**
   * Busca um role por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<Role | undefined> => {
      try {
        return await authenticatedRequest<Role>("get", `/role/${id}`)
      } catch (error) {
        console.error("Get role error:", error)
        throw error
      }
    },
    [authenticatedRequest]
  )

  return {
    LIST_ALL,
    GET_BY_ID,
  }
}
