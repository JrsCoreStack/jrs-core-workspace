import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema mínimo (Neon / cockpit): apenas `erp_user` com papel workspace.
 *
 * ⚠️ Bases já migradas pela versão antiga deste ficheiro **não** voltam a
 * executar este `up` automaticamente. Para alinhar, use migrações incrementais
 * (ex.: `1760000000012-erp-user-workspace-role`) ou recrie a base em dev.
 */
export class InitBaseTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role_enum AS ENUM (
          'ADMIN',
          'FINANCIAL',
          'COMMERCIAL_MANAGER',
          'COMMERCIAL'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_user (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name           VARCHAR(255)       NOT NULL,
        cpf            VARCHAR(11)        NOT NULL UNIQUE,
        email          VARCHAR(255)       NOT NULL UNIQUE,
        phone          VARCHAR(15)        NOT NULL,
        password       VARCHAR(255)       NOT NULL,
        totp_secret    VARCHAR(255)       NULL DEFAULT NULL,
        is2fa_enabled  BOOLEAN            NOT NULL DEFAULT false,
        last_login     TIMESTAMP          NULL DEFAULT NULL,
        status         user_status_enum   NOT NULL DEFAULT 'ACTIVE',
        role           user_role_enum     NOT NULL DEFAULT 'ADMIN',
        created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_user CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum;`);
  }
}
