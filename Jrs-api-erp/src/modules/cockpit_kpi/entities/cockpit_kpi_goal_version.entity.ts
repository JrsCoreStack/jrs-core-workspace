import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('erp_cockpit_kpi_goal_version')
export class CockpitKpiGoalVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'kpi_id', type: 'uuid' })
  kpi_id: string;

  @Column({ name: 'month_goal', type: 'numeric', precision: 18, scale: 4, default: 0 })
  month_goal: number;

  @Column({ name: 'annual_goal', type: 'numeric', precision: 18, scale: 4, default: 0 })
  annual_goal: number;

  @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'changed_by', type: 'varchar', length: 255, nullable: true })
  changed_by: string | null;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' })
  changed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

