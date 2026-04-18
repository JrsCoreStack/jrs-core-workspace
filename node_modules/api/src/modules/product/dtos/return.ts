import { ReturnProductCategoryDTO } from 'src/modules/product_category/dtos/return';

export class ReturnProductDTO {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_value: number;
  unit_sale_value: number;
  is_recurring: boolean;
  max_discount_percentage: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  category?: ReturnProductCategoryDTO | null;
}
