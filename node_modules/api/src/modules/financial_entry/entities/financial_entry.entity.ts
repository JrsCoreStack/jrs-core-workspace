import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { FinancialChartOfAccountsEntity } from 'src/modules/financial_chart_of_accounts/entities/financial_chart_of_accounts.entity';
import { FinancialEntryType } from 'src/utils/enums/financial_entry_type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_financial_entries')
@Index('IDX_FINANCIAL_ENTRIES_ACCOUNT_ID', ['account_id'])
@Index('IDX_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID', ['chart_of_account_id'])
@Index('IDX_FINANCIAL_ENTRIES_ENTRY_DATE', ['entry_date'])
@Index('IDX_FINANCIAL_ENTRIES_PAYMENT_METHOD', ['payment_method'])
@Index('IDX_FINANCIAL_ENTRIES_EVENT_ID', ['event_id'])
export class FinancialEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'chart_of_account_id',
    type: 'uuid',
    nullable: false,
  })
  chart_of_account_id: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: FinancialEntryType,
    enumName: 'financial_entry_type_enum',
    nullable: false,
  })
  type: FinancialEntryType;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  description: string;

  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  reference_id: string | null;

  @Column({
    name: 'reference_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  reference_type: string | null;

  @Column({
    name: 'external_source',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  external_source: string;

  @Column({
    name: 'entry_date',
    type: 'timestamp',
    nullable: false,
  })
  entry_date: Date;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  payment_method: string | null;

  @Column({
    name: 'event_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  event_name: string | null;

  @Column({
    name: 'event_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  event_id: string | null;

  @Column({
    name: 'installments',
    type: 'integer',
    nullable: true,
  })
  installments: number | null;

  @Column({
    name: 'card_brand',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  card_brand: string | null;

  @Column({
    name: 'payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  payment_id: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.financial_entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;

  @ManyToOne(
    () => FinancialChartOfAccountsEntity,
    (chart_of_account) => chart_of_account.financial_entries,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'chart_of_account_id', referencedColumnName: 'id' })
  chart_of_account: FinancialChartOfAccountsEntity;
}
