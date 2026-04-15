import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductCategoryService } from './product_category.service';
import { CreateProductCategoryDTO } from './dtos/create';
import { UpdateProductCategoryDTO } from './dtos/update';
import { ProductCategoryEntity } from './entities/product_category.entity';

@ApiTags('Categorias de Produto')
@ApiBearerAuth()
@Controller('product-category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Post()
  async create(
    @Body() createProductCategoryDTO: CreateProductCategoryDTO,
  ): Promise<ProductCategoryEntity> {
    return this.productCategoryService.create(createProductCategoryDTO);
  }

  @Get()
  async findAll(): Promise<ProductCategoryEntity[]> {
    return this.productCategoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductCategoryEntity> {
    return this.productCategoryService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductCategoryDTO: UpdateProductCategoryDTO,
  ): Promise<ProductCategoryEntity> {
    return this.productCategoryService.update(id, updateProductCategoryDTO);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.productCategoryService.delete(id);
    return { message: 'Categoria deletada com sucesso' };
  }
}
