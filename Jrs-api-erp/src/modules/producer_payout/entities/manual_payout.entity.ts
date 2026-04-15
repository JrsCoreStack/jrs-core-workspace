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
import { AccountEntity } from '../../account/entities/account.entity';
import { FinancialEntryEntity } from '../../financial_entry/entities/financial_entry.entity';

@Entity('erp_financial_payouts')
@Index('IDX_FINANCIAL_PAYOUTS_ACCOUNT_ID', ['account_id'])
@Index('IDX_FINANCIAL_PAYOUTS_EVENT_ID', ['event_id'])
@Index('IDX_FINANCIAL_PAYOUTS_FINANCIAL_ENTRY_ID', ['financial_entry_id'])
export class ManualPayoutEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
  })
  account_id: string;

  @Column({
    name: 'event_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  event_id: string | null;

  @Column({
    name: 'event_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  event_name: string | null;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'financial_entry_id',
    type: 'uuid',
    nullable: true,
  })
  financial_entry_id: string | null;

  @Column({
    name: 'payment_receiver',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  payment_receiver: string | null;

  @Column({
    name: 'payment_key',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  payment_key: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updated_at: Date;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @ManyToOne(() => FinancialEntryEntity)
  @JoinColumn({ name: 'financial_entry_id' })
  financial_entry: FinancialEntryEntity | null;
}
