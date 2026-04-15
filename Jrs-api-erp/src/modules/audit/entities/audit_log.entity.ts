import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('erp_audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_name' })
  table_name: string;

  @Column({ name: 'record_id' })
  record_id: string;

  @Column()
  operation: 'INSERT' | 'UPDATE' | 'DELETE';

  @Column({ type: 'jsonb', name: 'old_values', nullable: true })
  old_values: Record<string, any>;

  @Column({ type: 'jsonb', name: 'new_values', nullable: true })
  new_values: Record<string, any>;

  @Column({ type: 'text', array: true, name: 'changed_fields', nullable: true })
  changed_fields: string[];

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ name: 'account_id' })
  account_id: string;

  @Column({ name: 'ip_address', nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  timestamp: Date;
}
