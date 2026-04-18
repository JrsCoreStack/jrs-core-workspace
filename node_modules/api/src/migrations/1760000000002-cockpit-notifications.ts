import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitNotificationsMigration1760000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_cockpit_notification (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(16) NOT NULL DEFAULT 'info',
        source VARCHAR(32) NOT NULL DEFAULT 'system',
        link_url TEXT NULL,
        link_label VARCHAR(64) NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        read_at TIMESTAMPTZ NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_notification_created_at
      ON erp_cockpit_notification(created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_notification_unread
      ON erp_cockpit_notification(is_read, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_notification_source
      ON erp_cockpit_notification(source);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cockpit_notification_severity
      ON erp_cockpit_notification(severity);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_cockpit_notification;`);
  }
}

