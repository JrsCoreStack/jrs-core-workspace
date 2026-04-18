import { MigrationInterface, QueryRunner } from 'typeorm';

/** Desvio abaixo de -X% (meta mês) = crítico; entre -X% e 0 = atenção. Padrão 15 (comportamento anterior). */
export class CockpitKpiCriticalThreshold1760000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi
      ADD COLUMN IF NOT EXISTS critical_deviation_threshold_pct NUMERIC(10, 4) NOT NULL DEFAULT 15;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi
      DROP COLUMN IF EXISTS critical_deviation_threshold_pct;
    `);
  }
}
