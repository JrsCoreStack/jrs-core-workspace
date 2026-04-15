import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dtos/create';
import { UpdateProductDTO } from './dtos/update';
import { validate } from 'class-validator';
import { ProductCategoryService } from 'src/modules/product_category/product_category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  async create(createProductDTO: CreateProductDTO): Promise<ProductEntity> {
    const dto = Object.assign(new CreateProductDTO(), createProductDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }

    // Verificar se a categoria existe (se fornecida)
    if (createProductDTO.category_id) {
      await this.productCategoryService.findById(createProductDTO.category_id);
    }

    const product = this.productRepository.create({
      ...createProductDTO,
      is_recurring: createProductDTO.is_recurring ?? false,
      max_discount_percentage: createProductDTO.max_discount_percentage ?? 0,
      is_active: createProductDTO.is_active ?? true,
    });

    return this.productRepository.save(product);
  }

  async findAll(includeInactive: boolean = false): Promise<ProductEntity[]> {
    const where: any = {};
    if (!includeInactive) {
      where.is_active = true;
    }

    return this.productRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Produto não encontrado.`);
    }
    return product;
  }

  async findByCategory(categoryId: string, includeInactive: boolean = false): Promise<ProductEntity[]> {
    const where: any = { category_id: categoryId };
    if (!includeInactive) {
      where.is_active = true;
    }

    return this.productRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async update(
    id: string,
    updateProductDTO: UpdateProductDTO,
  ): Promise<ProductEntity> {
    const product = await this.findById(id);

    const dto = Object.assign(new UpdateProductDTO(), updateProductDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }

    // Verificar se a categoria existe (se fornecida)
    if (updateProductDTO.category_id !== undefined) {
      if (updateProductDTO.category_id) {
        await this.productCategoryService.findById(updateProductDTO.category_id);
      }
    }

    Object.assign(product, updateProductDTO);
    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productRepository.remove(product);
  }
}
