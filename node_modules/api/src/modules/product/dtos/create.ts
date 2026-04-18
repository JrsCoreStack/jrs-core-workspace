import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsUUID('4', { message: 'ID da categoria inválido' })
  @IsOptional()
  category_id?: string | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Valor de custo deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor de custo é obrigatório' })
  cost_value: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Valor unitário de venda deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor unitário de venda é obrigatório' })
  unit_sale_value: number;

  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Desconto máximo deve ser maior ou igual a zero' })
  @Max(100, { message: 'Desconto máximo deve ser menor ou igual a 100' })
  @IsOptional()
  max_discount_percentage?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
