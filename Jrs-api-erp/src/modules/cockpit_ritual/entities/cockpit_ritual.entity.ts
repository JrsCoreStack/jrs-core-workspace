import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type CockpitParticipant = {
  name: string;
  initials: string;
  color?: string;
};

@Entity('erp_cockpit_ritual')
export class CockpitRitualEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'area', type: 'varchar', length: 64 })
  area: string;

  @Column({ name: 'freq', type: 'varchar', length: 32 })
  freq: string;

  @Column({ name: 'owner_name', type: 'varchar', length: 255 })
  owner_name: string;

  @Column({ name: 'schedule', type: 'varchar', length: 255 })
  schedule: string;

  @Column({ name: 'duration_min', type: 'int', default: 60 })
  duration_min: number;

  @Column({ name: 'kpi_count', type: 'int', default: 0 })
  kpi_count: number;

  @Column({ name: 'tracked_sessions', type: 'int', default: 0 })
  tracked_sessions: number;

  @Column({ name: 'total_sessions', type: 'int', default: 0 })
  total_sessions: number;

  @Column({ name: 'tracking_label', type: 'varchar', length: 64, default: 'rastreadas' })
  tracking_label: string;

  @Column({ name: 'next_label', type: 'varchar', length: 255, default: '—' })
  next_label: string;

  @Column({ name: 'participants', type: 'jsonb', default: () => "'[]'::jsonb" })
  participants: CockpitParticipant[];

  @Column({ name: 'extra_participants', type: 'int', default: 0 })
  extra_participants: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'last_not_tracked_date', type: 'date', nullable: true })
  last_not_tracked_date: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

