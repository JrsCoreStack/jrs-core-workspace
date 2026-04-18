"use client";

import { useAuthService } from "@/hooks/use-auth-service";
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeListResponse } from "@/models/employee";
import { useCallback } from "react";

/**
 * Hook para operações de Colaboradores em Client Components
 */
export const useEmployeeService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista colaboradores com filtro opcional de busca
   */
  const LIST = useCallback(
    async (search?: string): Promise<Employee[] | undefined> => {
      try {
        const queryParams = new URLSearchParams();
        if (search && search.trim()) {
          queryParams.append("search", search.trim());
        }
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/user?${queryString}` : `/user`;
        
        return await authenticatedRequest<Employee[]>("get", endpoint);
      } catch (error) {
        console.error("List employees error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca um colaborador por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<Employee | undefined> => {
      try {
        return await authenticatedRequest<Employee>("get", `/user/${id}`);
      } catch (error) {
        console.error("Get employee error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Cria um novo colaborador
   */
  const CREATE = useCallback(
    async (data: CreateEmployeeDTO): Promise<Employee | undefined> => {
      try {
        return await authenticatedRequest<Employee>("post", "/user", data);
      } catch (error) {
        console.error("Create employee error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Atualiza um colaborador
   */
  const UPDATE = useCallback(
    async (id: string, data: UpdateEmployeeDTO): Promise<Employee | undefined> => {
      try {
        return await authenticatedRequest<Employee>("put", `/user/${id}`, data);
      } catch (error) {
        console.error("Update employee error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Deleta um colaborador
   */
  const DELETE = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await authenticatedRequest("delete", `/user/${id}`);
        return true;
      } catch (error) {
        console.error("Delete employee error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  return {
    LIST,
    GET_BY_ID,
    CREATE,
    UPDATE,
    DELETE,
  };
};
