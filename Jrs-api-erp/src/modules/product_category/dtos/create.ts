import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductCategoryDTO {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;
}
