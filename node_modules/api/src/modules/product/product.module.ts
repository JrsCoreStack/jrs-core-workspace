import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductCategoryModule } from 'src/modules/product_category/product_category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    ProductCategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
