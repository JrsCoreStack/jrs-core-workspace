import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitKpiAttentionThreshold1760000000008 implements MigrationInterface {
  name = 'CockpitKpiAttentionThreshold1760000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi
      ADD COLUMN IF NOT EXISTS attention_deviation_threshold_pct NUMERIC(10, 4) NOT NULL DEFAULT 5;
    `);
    await queryRunner.query(`
      UPDATE erp_cockpit_kpi
      SET attention_deviation_threshold_pct = LEAST(attention_deviation_threshold_pct, critical_deviation_threshold_pct)
      WHERE attention_deviation_threshold_pct > critical_deviation_threshold_pct;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi DROP COLUMN IF EXISTS attention_deviation_threshold_pct;
    `);
  }
}
