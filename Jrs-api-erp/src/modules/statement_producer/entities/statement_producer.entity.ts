import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { StatementTypeEntity } from 'src/modules/statement_type/entities/statement_type.entity';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_statement_producer')
export class StatementProducerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transaction_id',
    type: 'uuid',
    nullable: false,
  })
  transaction_id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'event_id',
    type: 'uuid',
    nullable: false,
  })
  event_id: string;

  @Column({
    name: 'statement_type_id',
    type: 'uuid',
    nullable: false,
  })
  statement_type_id: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(
    () => TransactionEntity,
    (transaction) => transaction.statements_producer,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: TransactionEntity;

  @ManyToOne(() => EventEntity, (event) => event.statements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event: EventEntity;

  @ManyToOne(
    () => StatementTypeEntity,
    (statementType) => statementType.statements_producer,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'statement_type_id', referencedColumnName: 'id' })
  statement_type: StatementTypeEntity;

  @ManyToOne(() => AccountEntity, (account) => account.statements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;
}
