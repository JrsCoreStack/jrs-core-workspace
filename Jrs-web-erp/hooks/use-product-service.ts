"use client";

import { useCallback } from "react";
import { useAuthService } from "./use-auth-service";
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ListProductsParams,
  ListProductsByCategoryParams,
} from "@/models/product";

/**
 * Hook para operações relacionadas a produtos
 */
export const useProductService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista produtos com filtros
   */
  const LIST = useCallback(
    async (params?: ListProductsParams): Promise<Product[] | undefined> => {
      try {
        const queryParams = new URLSearchParams();

        if (params?.includeInactive) {
          queryParams.append("includeInactive", "true");
        }

        const queryString = queryParams.toString();
        const url = `/product${queryString ? `?${queryString}` : ""}`;

        return await authenticatedRequest<Product[]>("get", url);
      } catch (error) {
        console.error("List products error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca um produto por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<Product | undefined> => {
      try {
        return await authenticatedRequest<Product>("get", `/product/${id}`);
      } catch (error) {
        console.error("Get product by id error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Lista produtos por categoria
   */
  const LIST_BY_CATEGORY = useCallback(
    async (params: ListProductsByCategoryParams): Promise<Product[] | undefined> => {
      try {
        const queryParams = new URLSearchParams();

        if (params.includeInactive) {
          queryParams.append("includeInactive", "true");
        }

        const queryString = queryParams.toString();
        const url = `/product/category/${params.categoryId}${queryString ? `?${queryString}` : ""}`;

        return await authenticatedRequest<Product[]>("get", url);
      } catch (error) {
        console.error("List products by category error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Cria um novo produto
   */
  const CREATE = useCallback(
    async (data: CreateProductDTO): Promise<Product | undefined> => {
      try {
        return await authenticatedRequest<Product>("post", "/product", data);
      } catch (error) {
        console.error("Create product error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Atualiza um produto existente
   */
  const UPDATE = useCallback(
    async (id: string, data: UpdateProductDTO): Promise<Product | undefined> => {
      try {
        return await authenticatedRequest<Product>("put", `/product/${id}`, data);
      } catch (error) {
        console.error("Update product error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Deleta um produto
   */
  const DELETE = useCallback(
    async (id: string): Promise<void> => {
      try {
        await authenticatedRequest("delete", `/product/${id}`);
      } catch (error) {
        console.error("Delete product error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  return {
    LIST,
    GET_BY_ID,
    LIST_BY_CATEGORY,
    CREATE,
    UPDATE,
    DELETE,
  };
};
