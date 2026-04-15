"use client";

import { useAuthService } from "@/hooks/use-auth-service";
import { Account } from "@/models/auth";
import { useCallback } from "react";

/**
 * Hook para operações de Contas em Client Components
 */
export const useAccountService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista todas as contas cadastradas no ERP
   */
  const LIST_ALL = useCallback(
    async (): Promise<Account[] | undefined> => {
      try {
        return await authenticatedRequest<Account[]>("get", "/account");
      } catch (error) {
        console.error("List all accounts error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca uma conta por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<Account | undefined> => {
      try {
        return await authenticatedRequest<Account>("get", `/account/${id}`);
      } catch (error) {
        console.error("Get account error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  return {
    LIST_ALL,
    GET_BY_ID,
  };
};
