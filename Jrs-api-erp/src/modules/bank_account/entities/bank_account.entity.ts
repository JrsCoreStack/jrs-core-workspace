import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { BankEntity } from 'src/modules/bank/entities/bank.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_bank_account')
export class BankAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'bank_id',
    type: 'uuid',
    nullable: false,
  })
  bank_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.bank_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;

  @ManyToOne(() => BankEntity, (bank) => bank.bank_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bank_id', referencedColumnName: 'id' })
  bank: BankEntity;
}
