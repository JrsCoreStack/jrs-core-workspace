import { BankEntity } from 'src/modules/bank/entities/bank.entity';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { StatementOrganizationEntity } from 'src/modules/statement_organization/entities/statement_organization.entity';
import { StatementProducerEntity } from 'src/modules/statement_producer/entities/statement_producer.entity';
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

@Entity('erp_transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'event_id',
    type: 'uuid',
    nullable: false,
  })
  event_id: string;

  @Column({
    name: 'bank_id',
    type: 'uuid',
    nullable: false,
  })
  bank_id: string;

  @Column({
    name: 'sale_id',
    type: 'integer',
    nullable: false,
  })
  sale_id: number;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  payment_method: string;

  @Column({
    name: 'payment_installments',
    type: 'integer',
    nullable: true,
  })
  payment_installments: number;

  @Column({
    name: 'payment_id',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  payment_id: string;

  @Column({
    name: 'payment_status',
    type: 'integer',
    nullable: false,
  })
  payment_status: number;

  @Column({
    name: 'total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => EventEntity, (event) => event.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event: EventEntity;

  @ManyToOne(() => BankEntity, (bank) => bank, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bank_id', referencedColumnName: 'id' })
  bank: BankEntity;

  @OneToMany(
    () => StatementOrganizationEntity,
    (statement) => statement.transaction,
    {
      onDelete: 'CASCADE',
    },
  )
  statements_organization: StatementOrganizationEntity[];

  @OneToMany(
    () => StatementProducerEntity,
    (statement) => statement.transaction,
    {
      onDelete: 'CASCADE',
    },
  )
  statements_producer: StatementProducerEntity[];
}
