import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('erp_cockpit_kpi')
export class CockpitKpiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'metric', type: 'varchar', length: 255 })
  metric: string;

  @Column({ name: 'code_ref', type: 'varchar', length: 32, nullable: true })
  code_ref: string | null;

  @Column({ name: 'unit', type: 'varchar', length: 32, default: '' })
  unit: string;

  @Column({ name: 'area', type: 'varchar', length: 64 })
  area: string;

  @Column({ name: 'kpi_type', type: 'varchar', length: 32, default: 'Monetário' })
  kpi_type: string;

  @Column({ name: 'aggregation', type: 'varchar', length: 32, default: 'Soma' })
  aggregation: string;

  @Column({ name: 'input_frequency', type: 'varchar', length: 32, default: 'Semanal' })
  input_frequency: string;

  @Column({ name: 'owner_name', type: 'varchar', length: 255, default: '' })
  owner_name: string;

  @Column({ name: 'owner_role', type: 'varchar', length: 255, nullable: true })
  owner_role: string | null;

  @Column({ name: 'is_cockpit', type: 'boolean', default: false })
  is_cockpit: boolean;

  /** Desvio % vs meta mês abaixo de -threshold = status crítico (ex.: 15 → crítico se &lt; -15%). */
  @Column({ name: 'critical_deviation_threshold_pct', type: 'numeric', precision: 10, scale: 4, default: 15 })
  critical_deviation_threshold_pct: number;

  /** Limite positivo em % para a faixa de atenção (deve ser ≤ crítico; ex.: 5 → desvio entre -5% e 0% = atenção “leve”). */
  @Column({ name: 'attention_deviation_threshold_pct', type: 'numeric', precision: 10, scale: 4, default: 5 })
  attention_deviation_threshold_pct: number;

  @Column({ name: 'month_goal', type: 'numeric', precision: 18, scale: 4, default: 0 })
  month_goal: number;

  @Column({ name: 'annual_goal', type: 'numeric', precision: 18, scale: 4, default: 0 })
  annual_goal: number;

  @Column({ name: 'current_value', type: 'numeric', precision: 18, scale: 4, nullable: true })
  current_value: number | null;

  @Column({ name: 'stale_periods', type: 'int', default: 0 })
  stale_periods: number;

  @Column({ name: 'ritual_id', type: 'uuid', nullable: true })
  ritual_id: string | null;

  @Column({ name: 'meeting_id', type: 'uuid', nullable: true })
  meeting_id: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

