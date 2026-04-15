import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitKpiResultSoftDelete1760000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS deleted_by_user_id UUID NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi_result
      ADD COLUMN IF NOT EXISTS deleted_by_name VARCHAR(255) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS deleted_by_name;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS deleted_by_user_id;`);
    await queryRunner.query(`ALTER TABLE erp_cockpit_kpi_result DROP COLUMN IF EXISTS deleted_at;`);
  }
}
