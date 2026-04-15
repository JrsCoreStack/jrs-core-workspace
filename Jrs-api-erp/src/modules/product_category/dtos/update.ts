import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProductCategoryDTO {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;
}
