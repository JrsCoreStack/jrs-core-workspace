import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitKpisMigration1760000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Expand KPI definition to match Cockpit UI needs
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi
        ADD COLUMN IF NOT EXISTS code_ref VARCHAR(32) NULL,
        ADD COLUMN IF NOT EXISTS kpi_type VARCHAR(32) NOT NULL DEFAULT 'Monetário',
        ADD COLUMN IF NOT EXISTS aggregation VARCHAR(32) NOT NULL DEFAULT 'Soma',
        ADD COLUMN IF NOT EXISTS input_frequency VARCHAR(32) NOT NULL DEFAULT 'Semanal',
        ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS owner_role VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS is_cockpit BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS month_goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS annual_goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS current_value NUMERIC(18, 4) NULL,
        ADD COLUMN IF NOT EXISTS stale_periods INT NOT NULL DEFAULT 0;
    `);

    // KPI results per period
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_kpi_result (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kpi_id UUID NOT NULL,
        period_label VARCHAR(32) NOT NULL,
        period_start DATE NULL,
        value NUMERIC(18, 4) NOT NULL DEFAULT 0,
        target NUMERIC(18, 4) NOT NULL DEFAULT 0,
        deviation_pct NUMERIC(10, 4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_kpi_result_kpi
          FOREIGN KEY (kpi_id) REFERENCES erp_cockpit_kpi(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_kpi_result_kpi_id
        ON erp_cockpit_kpi_result(kpi_id);
    `);

    // KPI goal versioning (history)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_kpi_goal_version (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kpi_id UUID NOT NULL,
        month_goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        annual_goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        note VARCHAR(255) NULL,
        changed_by VARCHAR(255) NULL,
        changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_kpi_goal_version_kpi
          FOREIGN KEY (kpi_id) REFERENCES erp_cockpit_kpi(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_kpi_goal_version_kpi_id
        ON erp_cockpit_kpi_goal_version(kpi_id);
    `);

    // KPI ↔ Ritual links (many-to-many)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_kpi_ritual (
        kpi_id UUID NOT NULL,
        ritual_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT pk_cockpit_kpi_ritual PRIMARY KEY (kpi_id, ritual_id),
        CONSTRAINT fk_cockpit_kpi_ritual_kpi
          FOREIGN KEY (kpi_id) REFERENCES erp_cockpit_kpi(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_cockpit_kpi_ritual_ritual
          FOREIGN KEY (ritual_id) REFERENCES erp_cockpit_ritual(id)
          ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_kpi_ritual;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_kpi_goal_version;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_kpi_result;`);

    await queryRunner.query(`
      ALTER TABLE erp_cockpit_kpi
        DROP COLUMN IF EXISTS code_ref,
        DROP COLUMN IF EXISTS kpi_type,
        DROP COLUMN IF EXISTS aggregation,
        DROP COLUMN IF EXISTS input_frequency,
        DROP COLUMN IF EXISTS owner_name,
        DROP COLUMN IF EXISTS owner_role,
        DROP COLUMN IF EXISTS is_cockpit,
        DROP COLUMN IF EXISTS month_goal,
        DROP COLUMN IF EXISTS annual_goal,
        DROP COLUMN IF EXISTS current_value,
        DROP COLUMN IF EXISTS stale_periods;
    `);
  }
}

