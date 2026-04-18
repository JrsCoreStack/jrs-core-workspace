import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitKpiResultEvidence1760000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS evidence_url VARCHAR(2048) NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS evidence_note VARCHAR(500) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS evidence_note;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS evidence_url;`);
  }
}
