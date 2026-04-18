import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('erp_cockpit_calendar_exception')
export class CockpitCalendarExceptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ritual_id', type: 'uuid', nullable: true })
  ritual_id: string | null;

  @Column({ name: 'occurrence_date', type: 'date' })
  occurrence_date: string;

  @Column({ name: 'exception_type', type: 'varchar', length: 32 })
  exception_type: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

