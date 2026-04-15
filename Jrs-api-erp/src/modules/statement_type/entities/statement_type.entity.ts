import { StatementOrganizationEntity } from 'src/modules/statement_organization/entities/statement_organization.entity';
import { StatementProducerEntity } from 'src/modules/statement_producer/entities/statement_producer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_statement_type')
export class StatementTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(
    () => StatementOrganizationEntity,
    (statement) => statement.statement_type,
    {
      onDelete: 'CASCADE',
    },
  )
  statements_organization: StatementOrganizationEntity[];

  @OneToMany(
    () => StatementProducerEntity,
    (statement) => statement.statement_type,
    {
      onDelete: 'CASCADE',
    },
  )
  statements_producer: StatementProducerEntity[];
}
