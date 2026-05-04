import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Evita timestamp duplicado com `1760000000003-cockpit-sync-columns.ts`.
 * Tabelas criadas com CREATE IF NOT EXISTS podem ficar sem colunas novas até esta migração.
 */
export class NotificationLinkLabel1760000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_notification
      ADD COLUMN IF NOT EXISTS link_label VARCHAR(64) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_notification DROP COLUMN IF EXISTS link_label;
    `);
  }
}
