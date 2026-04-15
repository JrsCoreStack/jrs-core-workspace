import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { FinancialEntryEntity } from 'src/modules/financial_entry/entities/financial_entry.entity';
import { ChartOfAccountsType } from 'src/utils/enums/chart_of_accounts_type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_financial_chart_of_accounts')
export class FinancialChartOfAccountsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  code: string;

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
    enum: ChartOfAccountsType,
    enumName: 'chart_of_accounts_type_enum',
    nullable: false,
  })
  type: ChartOfAccountsType;

  @Column({
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
  })
  parent_id: string | null;

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

  @ManyToOne(() => AccountEntity, (account) => account.chart_of_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;

  @ManyToOne(
    () => FinancialChartOfAccountsEntity,
    (parent) => parent.children,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
  parent: FinancialChartOfAccountsEntity | null;

  @OneToMany(
    () => FinancialChartOfAccountsEntity,
    (child) => child.parent,
    {
      onDelete: 'CASCADE',
    },
  )
  children: FinancialChartOfAccountsEntity[];

  @OneToMany(
    () => FinancialEntryEntity,
    (financial_entry) => financial_entry.chart_of_account,
    {
      onDelete: 'CASCADE',
    },
  )
  financial_entries: FinancialEntryEntity[];
}
