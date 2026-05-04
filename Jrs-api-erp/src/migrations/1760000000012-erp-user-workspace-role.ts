import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Para bases já existentes (ex.: apenas cockpit + erp_user sem coluna role):
 * garante tipo enum e acrescenta `role` na tabela de utilizadores.
 */
export class ErpUserWorkspaceRole1760000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
      ALTER TABLE erp_user
      ADD COLUMN IF NOT EXISTS role user_role_enum NOT NULL DEFAULT 'ADMIN';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_user DROP COLUMN IF EXISTS role;
    `);
  }
}
