import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tabelas criadas com CREATE IF NOT EXISTS antes desta coluna existir no script
 * não recebem novas colunas automaticamente — adiciona link_label se faltar.
 */
export class NotificationLinkLabel1760000000003 implements MigrationInterface {
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
