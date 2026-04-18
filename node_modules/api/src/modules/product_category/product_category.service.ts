import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryEntity } from './entities/product_category.entity';
import { Repository } from 'typeorm';
import { CreateProductCategoryDTO } from './dtos/create';
import { UpdateProductCategoryDTO } from './dtos/update';
import { validate } from 'class-validator';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
  ) {}

  async create(
    createProductCategoryDTO: CreateProductCategoryDTO,
  ): Promise<ProductCategoryEntity> {
    const dto = Object.assign(new CreateProductCategoryDTO(), createProductCategoryDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }

    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = await this.productCategoryRepository.findOne({
      where: { name: createProductCategoryDTO.name },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Já existe uma categoria com o nome "${createProductCategoryDTO.name}"`,
      );
    }

    const category = this.productCategoryRepository.create(createProductCategoryDTO);
    return this.productCategoryRepository.save(category);
  }

  async findAll(): Promise<ProductCategoryEntity[]> {
    return this.productCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ProductCategoryEntity> {
    const category = await this.productCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Categoria não encontrada.`);
    }
    return category;
  }

  async update(
    id: string,
    updateProductCategoryDTO: UpdateProductCategoryDTO,
  ): Promise<ProductCategoryEntity> {
    const category = await this.findById(id);

    const dto = Object.assign(new UpdateProductCategoryDTO(), updateProductCategoryDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }

    // Se está tentando atualizar o nome, verificar se já existe outra categoria com esse nome
    if (updateProductCategoryDTO.name && updateProductCategoryDTO.name !== category.name) {
      const existingCategory = await this.productCategoryRepository.findOne({
        where: { name: updateProductCategoryDTO.name },
      });

      if (existingCategory) {
        throw new BadRequestException(
          `Já existe uma categoria com o nome "${updateProductCategoryDTO.name}"`,
        );
      }
    }

    Object.assign(category, updateProductCategoryDTO);
    return this.productCategoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.productCategoryRepository.remove(category);
  }
}
