import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('erp_cockpit_kpi_result')
export class CockpitKpiResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'kpi_id', type: 'uuid' })
  kpi_id: string;

  @Column({ name: 'period_label', type: 'varchar', length: 32 })
  period_label: string;

  @Column({ name: 'period_start', type: 'date', nullable: true })
  period_start: string | null;

  @Column({ name: 'value', type: 'numeric', precision: 18, scale: 4, default: 0 })
  value: number;

  @Column({ name: 'target', type: 'numeric', precision: 18, scale: 4, default: 0 })
  target: number;

  @Column({ name: 'deviation_pct', type: 'numeric', precision: 10, scale: 4, default: 0 })
  deviation_pct: number;

  @Column({ name: 'evidence_url', type: 'varchar', length: 2048, nullable: true })
  evidence_url: string | null;

  @Column({ name: 'evidence_note', type: 'varchar', length: 500, nullable: true })
  evidence_note: string | null;

  /** Caminho relativo em disco (uploads/cockpit-kpi-evidence/...) */
  @Column({ name: 'evidence_file_key', type: 'varchar', length: 512, nullable: true })
  evidence_file_key: string | null;

  @Column({ name: 'evidence_file_name', type: 'varchar', length: 512, nullable: true })
  evidence_file_name: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ name: 'deleted_by_user_id', type: 'uuid', nullable: true })
  deleted_by_user_id: string | null;

  /** Snapshot do nome no momento da exclusão (auditoria). */
  @Column({ name: 'deleted_by_name', type: 'varchar', length: 255, nullable: true })
  deleted_by_name: string | null;
}

