import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitSyncColumns1760000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure erp_cockpit_ritual has all required columns
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_ritual (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        area VARCHAR(64) NOT NULL,
        freq VARCHAR(32) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        schedule VARCHAR(255) NOT NULL,
        duration_min INT NOT NULL DEFAULT 60,
        kpi_count INT NOT NULL DEFAULT 0,
        tracked_sessions INT NOT NULL DEFAULT 0,
        total_sessions INT NOT NULL DEFAULT 0,
        tracking_label VARCHAR(64) NOT NULL DEFAULT 'rastreadas',
        next_label VARCHAR(255) NOT NULL DEFAULT '—',
        participants JSONB NOT NULL DEFAULT '[]'::jsonb,
        extra_participants INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_not_tracked_date DATE NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Add missing columns if table already existed with fewer columns
    const ritualCols = [
      "ADD COLUMN IF NOT EXISTS freq VARCHAR(32) NOT NULL DEFAULT 'SEMANAL'",
      "ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255) NOT NULL DEFAULT ''",
      "ADD COLUMN IF NOT EXISTS schedule VARCHAR(255) NOT NULL DEFAULT ''",
      "ADD COLUMN IF NOT EXISTS duration_min INT NOT NULL DEFAULT 60",
      "ADD COLUMN IF NOT EXISTS kpi_count INT NOT NULL DEFAULT 0",
      "ADD COLUMN IF NOT EXISTS tracked_sessions INT NOT NULL DEFAULT 0",
      "ADD COLUMN IF NOT EXISTS total_sessions INT NOT NULL DEFAULT 0",
      "ADD COLUMN IF NOT EXISTS tracking_label VARCHAR(64) NOT NULL DEFAULT 'rastreadas'",
      "ADD COLUMN IF NOT EXISTS next_label VARCHAR(255) NOT NULL DEFAULT '—'",
      "ADD COLUMN IF NOT EXISTS participants JSONB NOT NULL DEFAULT '[]'::jsonb",
      "ADD COLUMN IF NOT EXISTS extra_participants INT NOT NULL DEFAULT 0",
      "ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
      "ADD COLUMN IF NOT EXISTS last_not_tracked_date DATE NULL",
    ];
    await queryRunner.query(`ALTER TABLE erp_cockpit_ritual ${ritualCols.join(', ')};`);

    // Ensure erp_cockpit_meeting has all required columns
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_meeting (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ritual_id UUID NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        duration_min INT NOT NULL DEFAULT 60,
        state VARCHAR(32) NOT NULL DEFAULT 'done',
        ata JSONB NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure erp_cockpit_action_plan has all required columns
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_action_plan (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'planned',
        area VARCHAR(64) NOT NULL DEFAULT '',
        owner_name VARCHAR(255) NOT NULL DEFAULT '',
        due_date DATE NOT NULL DEFAULT CURRENT_DATE,
        priority VARCHAR(16) NOT NULL DEFAULT 'medium',
        ritual_id UUID NULL,
        meeting_id UUID NULL,
        history JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const planCols = [
      "ADD COLUMN IF NOT EXISTS description TEXT NULL",
      "ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'::jsonb",
      "ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
      "ADD COLUMN IF NOT EXISTS notes TEXT NULL",
      "ADD COLUMN IF NOT EXISTS blocked_note TEXT NULL",
    ];
    await queryRunner.query(`ALTER TABLE erp_cockpit_action_plan ${planCols.join(', ')};`);

    // Ensure erp_cockpit_kpi exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_kpi (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        metric VARCHAR(255) NOT NULL DEFAULT '',
        goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        unit VARCHAR(32) NOT NULL DEFAULT '',
        area VARCHAR(64) NOT NULL DEFAULT '',
        ritual_id UUID NULL,
        meeting_id UUID NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure erp_cockpit_calendar_exception exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_calendar_exception (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ritual_id UUID NULL,
        occurrence_date DATE NOT NULL,
        exception_type VARCHAR(32) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure erp_cockpit_notification exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_notification (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        source VARCHAR(32) NOT NULL DEFAULT 'system',
        severity VARCHAR(16) NOT NULL DEFAULT 'info',
        is_read BOOLEAN NOT NULL DEFAULT false,
        read_at TIMESTAMPTZ NULL,
        link_url VARCHAR(512) NULL,
        metadata JSONB NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No destructive down — columns added with IF NOT EXISTS are safe
  }
}
