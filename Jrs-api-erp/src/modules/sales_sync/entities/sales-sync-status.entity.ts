import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_sales_sync_status')
export class SalesSyncStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'sync_type',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  sync_type: string; // Formato: 'PRODUCT_ID_REFERENCE_TYPE' (ex: 'OTICKET_EVENTOS_TICKET_ONLINE_SALE')

  @Column({
    name: 'last_synced_id',
    type: 'bigint',
    nullable: true,
  })
  last_synced_id: number | null;

  @Column({
    name: 'last_synced_date',
    type: 'timestamp',
    nullable: true,
  })
  last_synced_date: Date | null;

  @Column({
    name: 'total_synced',
    type: 'integer',
    default: 0,
  })
  total_synced: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
