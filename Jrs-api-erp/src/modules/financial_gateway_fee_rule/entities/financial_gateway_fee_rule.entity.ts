import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { FinancialCardBrand } from 'src/utils/enums/financial_card_brand.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('erp_financial_gateway_fee_rules')
export class FinancialGatewayFeeRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'gateway',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  gateway: string;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  payment_method: string;

  @Column({
    name: 'card_brand',
    type: 'enum',
    enum: FinancialCardBrand,
    enumName: 'financial_card_brand_enum',
    nullable: true,
  })
  card_brand: FinancialCardBrand | null;

  @Column({
    name: 'installments',
    type: 'integer',
    nullable: true,
  })
  installments: number | null;

  @Column({
    name: 'percentage_fee',
    type: 'decimal',
    precision: 6,
    scale: 4,
    nullable: false,
  })
  percentage_fee: number;

  @Column({
    name: 'fixed_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  fixed_fee: number;

  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;
}
