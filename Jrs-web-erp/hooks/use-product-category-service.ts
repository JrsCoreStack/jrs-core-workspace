"use client";

import { useCallback } from "react";
import { useAuthService } from "./use-auth-service";
import {
  ProductCategory,
  CreateProductCategoryDTO,
  UpdateProductCategoryDTO,
} from "@/models/product";

/**
 * Hook para operações relacionadas a categorias de produtos
 */
export const useProductCategoryService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista todas as categorias
   */
  const LIST = useCallback(
    async (): Promise<ProductCategory[] | undefined> => {
      try {
        return await authenticatedRequest<ProductCategory[]>("get", "/product-category");
      } catch (error) {
        console.error("List product categories error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca uma categoria por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<ProductCategory | undefined> => {
      try {
        return await authenticatedRequest<ProductCategory>("get", `/product-category/${id}`);
      } catch (error) {
        console.error("Get product category by id error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Cria uma nova categoria
   */
  const CREATE = useCallback(
    async (data: CreateProductCategoryDTO): Promise<ProductCategory | undefined> => {
      try {
        return await authenticatedRequest<ProductCategory>("post", "/product-category", data);
      } catch (error) {
        console.error("Create product category error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Atualiza uma categoria existente
   */
  const UPDATE = useCallback(
    async (id: string, data: UpdateProductCategoryDTO): Promise<ProductCategory | undefined> => {
      try {
        return await authenticatedRequest<ProductCategory>("put", `/product-category/${id}`, data);
      } catch (error) {
        console.error("Update product category error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Deleta uma categoria
   */
  const DELETE = useCallback(
    async (id: string): Promise<void> => {
      try {
        await authenticatedRequest("delete", `/product-category/${id}`);
      } catch (error) {
        console.error("Delete product category error:", error);
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
