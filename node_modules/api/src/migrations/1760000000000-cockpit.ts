import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitMigration1760000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cockpit Rituals
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

    // Cockpit Meetings (Ata)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_meeting (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ritual_id UUID NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        duration_min INT NOT NULL DEFAULT 60,
        state VARCHAR(32) NOT NULL DEFAULT 'done',
        ata JSONB NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_meeting_ritual
          FOREIGN KEY (ritual_id) REFERENCES erp_cockpit_ritual(id)
          ON DELETE SET NULL
      );
    `);

    // Cockpit Action Plans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_action_plan (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status VARCHAR(32) NOT NULL,
        area VARCHAR(64) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        priority VARCHAR(16) NOT NULL DEFAULT 'medium',
        ritual_id UUID NULL,
        meeting_id UUID NULL,
        history JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_action_plan_ritual
          FOREIGN KEY (ritual_id) REFERENCES erp_cockpit_ritual(id)
          ON DELETE SET NULL,
        CONSTRAINT fk_cockpit_action_plan_meeting
          FOREIGN KEY (meeting_id) REFERENCES erp_cockpit_meeting(id)
          ON DELETE SET NULL
      );
    `);

    // Cockpit KPIs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_kpi (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        metric VARCHAR(255) NOT NULL,
        goal NUMERIC(18, 4) NOT NULL DEFAULT 0,
        unit VARCHAR(32) NOT NULL DEFAULT '',
        area VARCHAR(64) NOT NULL,
        ritual_id UUID NULL,
        meeting_id UUID NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_kpi_ritual
          FOREIGN KEY (ritual_id) REFERENCES erp_cockpit_ritual(id)
          ON DELETE SET NULL,
        CONSTRAINT fk_cockpit_kpi_meeting
          FOREIGN KEY (meeting_id) REFERENCES erp_cockpit_meeting(id)
          ON DELETE SET NULL
      );
    `);

    // Cockpit Calendar Exceptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_calendar_exception (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ritual_id UUID NULL,
        occurrence_date DATE NOT NULL,
        exception_type VARCHAR(32) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_cockpit_calendar_exception_ritual
          FOREIGN KEY (ritual_id) REFERENCES erp_cockpit_ritual(id)
          ON DELETE SET NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_calendar_exception;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_kpi;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_action_plan;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_meeting;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_ritual;`);
  }
}

