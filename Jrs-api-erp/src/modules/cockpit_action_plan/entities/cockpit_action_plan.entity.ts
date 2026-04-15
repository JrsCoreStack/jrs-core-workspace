import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('erp_cockpit_action_plan')
export class CockpitActionPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'status', type: 'varchar', length: 32 })
  status: string;

  @Column({ name: 'area', type: 'varchar', length: 64 })
  area: string;

  @Column({ name: 'owner_name', type: 'varchar', length: 255 })
  owner_name: string;

  @Column({ name: 'due_date', type: 'date' })
  due_date: string;

  @Column({ name: 'priority', type: 'varchar', length: 16, default: 'medium' })
  priority: string;

  @Column({ name: 'ritual_id', type: 'uuid', nullable: true })
  ritual_id: string | null;

  @Column({ name: 'meeting_id', type: 'uuid', nullable: true })
  meeting_id: string | null;

  @Column({ name: 'depends_on_plan_id', type: 'uuid', nullable: true })
  depends_on_plan_id: string | null;

  @Column({ name: 'comments', type: 'jsonb', default: () => "'[]'::jsonb" })
  comments: { id: string; text: string; at: string; by: string; parent_id?: string | null }[];

  @Column({ name: 'history', type: 'jsonb', default: () => "'[]'::jsonb" })
  history: any[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

