/**
 * DTOs e tipos para Product (Produtos/Serviços) e ProductCategory
 */

/**
 * Interface para Categoria de Produto
 */
export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface completa da entidade Product
 */
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  cost_value: string; // String no formato decimal (ex: "50.00")
  unit_sale_value: string; // String no formato decimal (ex: "150.00")
  is_recurring: boolean;
  max_discount_percentage: string; // String no formato decimal (ex: "10.00")
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory | null; // Relacionamento com categoria
}

/**
 * DTO para criar uma nova categoria
 */
export interface CreateProductCategoryDTO {
  name: string;
}

/**
 * DTO para atualizar uma categoria
 */
export interface UpdateProductCategoryDTO {
  name?: string;
}

/**
 * DTO para criar um novo produto
 */
export interface CreateProductDTO {
  name: string;
  description?: string | null;
  category_id?: string | null;
  cost_value: number; // Número ao enviar (ex: 50.00)
  unit_sale_value: number; // Número ao enviar (ex: 150.00)
  is_recurring?: boolean;
  max_discount_percentage?: number; // 0-100, padrão: 0
  is_active?: boolean;
}

/**
 * DTO para atualizar um produto existente
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string | null;
  category_id?: string | null;
  cost_value?: number;
  unit_sale_value?: number;
  is_recurring?: boolean;
  max_discount_percentage?: number;
  is_active?: boolean;
}

/**
 * Parâmetros de filtro para listagem de produtos
 */
export interface ListProductsParams {
  includeInactive?: boolean; // Se true, inclui produtos inativos
}

/**
 * Parâmetros para listar produtos por categoria
 */
export interface ListProductsByCategoryParams {
  categoryId: string;
  includeInactive?: boolean;
}
