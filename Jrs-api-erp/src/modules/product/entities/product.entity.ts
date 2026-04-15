import { ProductCategoryEntity } from 'src/modules/product_category/entities/product_category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'category_id',
    type: 'uuid',
    nullable: true,
  })
  category_id: string | null;

  @Column({
    name: 'cost_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: false,
    default: 0,
  })
  cost_value: number;

  @Column({
    name: 'unit_sale_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: false,
    default: 0,
  })
  unit_sale_value: number;

  @Column({
    name: 'is_recurring',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  is_recurring: boolean;

  @Column({
    name: 'max_discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  max_discount_percentage: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(
    () => ProductCategoryEntity,
    (category) => category.products,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: ProductCategoryEntity | null;
}
