import { MigrationInterface, QueryRunner } from 'typeorm';
import { inferPeriodStartFromLabel } from '../modules/cockpit_kpi/utils/infer-period-start';

/**
 * Preenche period_start em lançamentos antigos a partir de period_label (ex.: "Abr 2026").
 */
export class BackfillKpiResultPeriodStart1760000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows: { id: string; period_label: string }[] = await queryRunner.query(
      `SELECT id, period_label FROM erp_cockpit_kpi_result WHERE period_start IS NULL`,
    );
    for (const row of rows) {
      const ps = inferPeriodStartFromLabel(row.period_label);
      if (ps) {
        await queryRunner.query(`UPDATE erp_cockpit_kpi_result SET period_start = $1::date WHERE id = $2`, [
          ps,
          row.id,
        ]);
      }
    }
  }

  public async down(): Promise<void> {
    /* backfill de dados — sem reversão segura */
  }
}
