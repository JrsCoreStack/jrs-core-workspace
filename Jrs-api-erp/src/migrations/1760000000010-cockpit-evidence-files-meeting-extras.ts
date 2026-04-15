import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitEvidenceFilesMeetingExtras1760000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS evidence_file_key VARCHAR(512) NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS evidence_file_name VARCHAR(512) NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_meeting
      ADD COLUMN IF NOT EXISTS agenda_items JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_meeting
      ADD COLUMN IF NOT EXISTS meeting_participants JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_meeting
      ADD COLUMN IF NOT EXISTS ata_template_id VARCHAR(64) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE erp_cockpit_meeting DROP COLUMN IF EXISTS ata_template_id;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_meeting DROP COLUMN IF EXISTS meeting_participants;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_meeting DROP COLUMN IF EXISTS agenda_items;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS evidence_file_name;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS evidence_file_key;`);
  }
}
