import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { StatementOrganizationEntity } from 'src/modules/statement_organization/entities/statement_organization.entity';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity';
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

@Entity('erp_event')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'id_reference',
    type: 'int',
    nullable: false,
  })
  id_reference: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'start_date',
    type: 'timestamp',
    nullable: false,
  })
  start_date: Date;

  @Column({
    name: 'end_date',
    type: 'timestamp',
    nullable: false,
  })
  end_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => AccountEntity, (account) => account.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.event, {
    onDelete: 'CASCADE',
  })
  transactions: TransactionEntity[];

  @OneToMany(
    () => StatementOrganizationEntity,
    (statement) => statement.event,
    {
      onDelete: 'CASCADE',
    },
  )
  statements: StatementOrganizationEntity[];
}
