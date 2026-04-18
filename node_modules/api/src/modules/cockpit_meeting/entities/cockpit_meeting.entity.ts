import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CockpitRitualEntity } from 'src/modules/cockpit_ritual/entities/cockpit_ritual.entity';

@Entity('erp_cockpit_meeting')
export class CockpitMeetingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ritual_id', type: 'uuid', nullable: true })
  ritual_id: string | null;

  @ManyToOne(() => CockpitRitualEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ritual_id', referencedColumnName: 'id' })
  ritual: CockpitRitualEntity | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurred_at: Date;

  @Column({ name: 'duration_min', type: 'int', default: 60 })
  duration_min: number;

  @Column({ name: 'state', type: 'varchar', length: 32, default: 'done' })
  state: string;

  @Column({ name: 'ata', type: 'jsonb', nullable: true })
  ata: any | null;

  /** Pauta fixa + itens de checklist com dono e status */
  @Column({ name: 'agenda_items', type: 'jsonb', default: () => "'[]'::jsonb" })
  agenda_items: unknown[];

  /** Participantes (opcional: user_id do ERP) + presença */
  @Column({ name: 'meeting_participants', type: 'jsonb', default: () => "'[]'::jsonb" })
  meeting_participants: unknown[];

  @Column({ name: 'ata_template_id', type: 'varchar', length: 64, nullable: true })
  ata_template_id: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

