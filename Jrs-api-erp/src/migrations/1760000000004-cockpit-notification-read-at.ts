import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tabelas criadas antes de read_at entrarem na 1760000000002 ficam sem a coluna
 * porque CREATE TABLE IF NOT EXISTS não aplica o novo DDL.
 */
export class CockpitNotificationReadAt1760000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_notification
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_notification
      DROP COLUMN IF EXISTS read_at;
    `);
  }
}
