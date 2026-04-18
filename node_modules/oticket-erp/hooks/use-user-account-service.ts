"use client";

import { useAuthService } from "@/hooks/use-auth-service";
import {
  UserAccount,
  CreateUserAccountDTO,
  UserAccountResponse,
} from "@/models/user-account";
import { useCallback } from "react";

/**
 * Hook para operações de vínculos User-Account em Client Components
 */
export const useUserAccountService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista todos os vínculos de um usuário
   */
  const LIST_BY_USER = useCallback(
    async (userId: string): Promise<UserAccount[] | undefined> => {
      try {
        return await authenticatedRequest<UserAccount[]>(
          "get",
          `/user_account/user/${userId}`
        );
      } catch (error) {
        console.error("List user accounts error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Lista todos os vínculos de uma conta
   */
  const LIST_BY_ACCOUNT = useCallback(
    async (accountId: string): Promise<UserAccount[] | undefined> => {
      try {
        return await authenticatedRequest<UserAccount[]>(
          "get",
          `/user_account/account/${accountId}`
        );
      } catch (error) {
        console.error("List account users error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Cria um novo vínculo entre usuário e conta
   */
  const CREATE = useCallback(
    async (data: CreateUserAccountDTO): Promise<UserAccountResponse | undefined> => {
      try {
        return await authenticatedRequest<UserAccountResponse>(
          "post",
          "/user_account",
          data
        );
      } catch (error) {
        console.error("Create user account error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Cria múltiplos vínculos entre usuário e contas com roles
   */
  const CREATE_MULTIPLE = useCallback(
    async (
      userId: string,
      accountRoles: Array<{ account_id: string; role_id?: string }>
    ): Promise<UserAccountResponse[] | undefined> => {
      try {
        const promises = accountRoles.map(({ account_id, role_id }) =>
          authenticatedRequest<UserAccountResponse>("post", "/user_account", {
            user_id: userId,
            account_id: account_id,
            role_id: role_id,
          })
        );
        return await Promise.all(promises);
      } catch (error) {
        console.error("Create multiple user accounts error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Deleta um vínculo específico
   */
  const DELETE = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await authenticatedRequest("delete", `/user_account/${id}`);
        return true;
      } catch (error) {
        console.error("Delete user account error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Deleta todos os vínculos de um usuário
   */
  const DELETE_BY_USER = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await authenticatedRequest("delete", `/user_account/user/${userId}`);
        return true;
      } catch (error) {
        console.error("Delete user accounts by user error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Sincroniza os vínculos de um usuário (adiciona novos e remove os que não estão mais na lista)
   * accountRoles: Array de { account_id, role_id }
   */
  const SYNC_USER_ACCOUNTS = useCallback(
    async (
      userId: string,
      accountRoles: Array<{ account_id: string; role_id?: string }>
    ): Promise<UserAccountResponse[] | undefined> => {
      try {
        // Buscar vínculos existentes
        const existingLinks = await LIST_BY_USER(userId) || []
        const existingAccountIds = existingLinks.map(link => link.account_id)
        const newAccountIds = accountRoles.map(ar => ar.account_id)
        
        // Identificar contas para adicionar (estão na nova lista mas não existem)
        const accountsToAdd = accountRoles.filter(
          ar => !existingAccountIds.includes(ar.account_id)
        )
        
        // Identificar contas para atualizar (existem mas podem ter role diferente)
        const accountsToUpdate = accountRoles.filter(ar => {
          const existing = existingLinks.find(link => link.account_id === ar.account_id)
          return existing && existing.role_id !== ar.role_id
        })
        
        // Identificar contas para remover (existem mas não estão na nova lista)
        const accountsToRemove = existingLinks.filter(
          link => !newAccountIds.includes(link.account_id)
        )
        
        // Executar operações em paralelo
        const promises: Promise<any>[] = []
        
        // Adicionar novos vínculos
        if (accountsToAdd.length > 0) {
          promises.push(CREATE_MULTIPLE(userId, accountsToAdd))
        }
        
        // Atualizar vínculos existentes (deletar e recriar com novo role)
        if (accountsToUpdate.length > 0) {
          const updatePromises = accountsToUpdate.map(async (ar) => {
            const existing = existingLinks.find(link => link.account_id === ar.account_id)
            if (existing) {
              await DELETE(existing.id)
              return authenticatedRequest<UserAccountResponse>("post", "/user_account", {
                user_id: userId,
                account_id: ar.account_id,
                role_id: ar.role_id,
              })
            }
          })
          promises.push(Promise.all(updatePromises))
        }
        
        // Remover vínculos que não estão mais na lista
        if (accountsToRemove.length > 0) {
          const deletePromises = accountsToRemove.map(link => DELETE(link.id))
          promises.push(Promise.all(deletePromises))
        }
        
        // Aguardar todas as operações
        if (promises.length > 0) {
          await Promise.all(promises)
        }
        
        // Retornar os vínculos atualizados
        return await LIST_BY_USER(userId)
      } catch (error) {
        console.error("Sync user accounts error:", error)
        throw error
      }
    },
    [LIST_BY_USER, CREATE_MULTIPLE, DELETE, authenticatedRequest]
  )

  return {
    LIST_BY_USER,
    LIST_BY_ACCOUNT,
    CREATE,
    CREATE_MULTIPLE,
    DELETE,
    DELETE_BY_USER,
    SYNC_USER_ACCOUNTS,
  };
};
