import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dtos/create';
import { UpdateProductDTO } from './dtos/update';
import { ProductEntity } from './entities/product.entity';

@ApiExcludeController()
@ApiTags('Produtos')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDTO: CreateProductDTO): Promise<ProductEntity> {
    return this.productService.create(createProductDTO);
  }

  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ProductEntity[]> {
    const includeInactiveBool = includeInactive === 'true';
    return this.productService.findAll(includeInactiveBool);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ProductEntity[]> {
    const includeInactiveBool = includeInactive === 'true';
    return this.productService.findByCategory(categoryId, includeInactiveBool);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductEntity> {
    return this.productService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDTO: UpdateProductDTO,
  ): Promise<ProductEntity> {
    return this.productService.update(id, updateProductDTO);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.productService.delete(id);
    return { message: 'Produto deletado com sucesso' };
  }
}
