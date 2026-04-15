import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { FinancialAccountType } from 'src/utils/enums/financial_account_type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_financial_accounts')
export class FinancialAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: FinancialAccountType,
    enumName: 'financial_account_type_enum',
    nullable: false,
  })
  type: FinancialAccountType;

  @Column({
    name: 'currency',
    type: 'char',
    length: 3,
    nullable: false,
    default: 'BRL',
  })
  currency: string;

  @Column({
    name: 'initial_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: false,
    default: 0,
  })
  initial_balance: number;

  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.financial_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;
}
