import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type CockpitNotificationSeverity = 'critical' | 'alert' | 'info';
export type CockpitNotificationSource =
  | 'action_plan'
  | 'kpi'
  | 'ritual'
  | 'meeting'
  | 'calendar'
  | 'system';

@Entity('erp_cockpit_notification')
export class CockpitNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'severity', type: 'varchar', length: 16, default: 'info' })
  severity: CockpitNotificationSeverity;

  @Column({ name: 'source', type: 'varchar', length: 32, default: 'system' })
  source: CockpitNotificationSource;

  @Column({ name: 'link_url', type: 'text', nullable: true })
  link_url: string | null;

  @Column({ name: 'link_label', type: 'varchar', length: 64, nullable: true })
  link_label: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  read_at: Date | null;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

