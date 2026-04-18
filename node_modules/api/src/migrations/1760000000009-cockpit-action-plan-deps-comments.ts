import { MigrationInterface, QueryRunner } from 'typeorm';

export class CockpitActionPlanDepsComments1760000000009 implements MigrationInterface {
  name = 'CockpitActionPlanDepsComments1760000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan
      ADD COLUMN IF NOT EXISTS depends_on_plan_id UUID NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan
      ADD CONSTRAINT fk_action_plan_depends_on
      FOREIGN KEY (depends_on_plan_id) REFERENCES erp_cockpit_action_plan(id)
      ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan
      ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan DROP CONSTRAINT IF EXISTS fk_action_plan_depends_on;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan DROP COLUMN IF EXISTS comments;
    `);
    await queryRunner.query(`
      ALTER TABLE erp_cockpit_action_plan DROP COLUMN IF EXISTS depends_on_plan_id;
    `);
  }
}
