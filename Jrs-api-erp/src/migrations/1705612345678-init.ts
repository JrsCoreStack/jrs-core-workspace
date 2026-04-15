import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1705612345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* ── Enums ─────────────────────────────────────────────── */
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE account_level_enum AS ENUM ('MASTER', 'OPERATIONAL');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'FINANCIAL', 'COMMERCIAL_MANAGER', 'COMMERCIAL');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    /* ── erp_user ──────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_user (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(255)       NOT NULL,
        cpf           VARCHAR(11)        NOT NULL UNIQUE,
        email         VARCHAR(255)       NOT NULL UNIQUE,
        phone         VARCHAR(15)        NOT NULL,
        password      VARCHAR(255)       NOT NULL,
        totp_secret   VARCHAR(255)       NULL DEFAULT NULL,
        is2fa_enabled BOOLEAN            NOT NULL DEFAULT false,
        last_login    TIMESTAMP          NULL DEFAULT NULL,
        status        user_status_enum   NOT NULL DEFAULT 'ACTIVE',
        created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_account ───────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_account (
        id         UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255)       NOT NULL,
        code       VARCHAR(255)       NOT NULL,
        email      VARCHAR(255)       NOT NULL UNIQUE,
        type       INT                NOT NULL UNIQUE,
        level      account_level_enum NOT NULL DEFAULT 'OPERATIONAL',
        created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ        NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_roles ─────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_roles (
        id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        name        user_role_enum NOT NULL UNIQUE,
        description TEXT           NULL,
        created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_permissions ───────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_permissions (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT         NULL,
        module      VARCHAR(50)  NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_role_permission ───────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_role_permission (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id       UUID        NOT NULL,
        permission_id UUID        NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES erp_roles(id)       ON DELETE CASCADE,
        CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES erp_permissions(id) ON DELETE CASCADE,
        CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
      );
    `);

    /* ── erp_user_account ──────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_user_account (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID        NOT NULL,
        account_id UUID        NOT NULL,
        role_id    UUID        NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_ua_user    FOREIGN KEY (user_id)    REFERENCES erp_user(id)    ON DELETE CASCADE,
        CONSTRAINT fk_ua_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_ua_role    FOREIGN KEY (role_id)    REFERENCES erp_roles(id)   ON DELETE SET NULL
      );
    `);

    /* ── erp_bank ──────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_bank (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL,
        code       VARCHAR(10)  NOT NULL UNIQUE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_bank_account ──────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_bank_account (
        id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id     UUID         NOT NULL,
        bank_id        UUID         NULL,
        agency         VARCHAR(10)  NOT NULL,
        account_number VARCHAR(20)  NOT NULL,
        digit          VARCHAR(2)   NOT NULL,
        created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_ba_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_ba_bank    FOREIGN KEY (bank_id)    REFERENCES erp_bank(id)    ON DELETE SET NULL
      );
    `);

    /* ── erp_event ─────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_event (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID         NOT NULL,
        name       VARCHAR(255) NOT NULL,
        code       VARCHAR(100) NULL,
        date       DATE         NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_event_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* ── erp_product_category ──────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_product_category (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL,
        description TEXT         NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_product ───────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_product (
        id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255)   NOT NULL,
        description TEXT           NULL,
        price       NUMERIC(18,4)  NOT NULL DEFAULT 0,
        category_id UUID           NULL,
        is_active   BOOLEAN        NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES erp_product_category(id) ON DELETE SET NULL
      );
    `);

    /* ── erp_audit_log ─────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_audit_log (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID         NULL,
        account_id   UUID         NULL,
        action       VARCHAR(255) NOT NULL,
        entity       VARCHAR(100) NULL,
        entity_id    VARCHAR(100) NULL,
        old_value    JSONB        NULL,
        new_value    JSONB        NULL,
        ip_address   VARCHAR(45)  NULL,
        user_agent   TEXT         NULL,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_statement_type ────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_type (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_financial_chart_of_accounts ───────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_chart_of_accounts (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID         NOT NULL,
        name       VARCHAR(255) NOT NULL,
        code       VARCHAR(50)  NULL,
        type       VARCHAR(50)  NULL,
        is_active  BOOLEAN      NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_coa_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* ── erp_financial_account ─────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_account (
        id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID           NOT NULL,
        name       VARCHAR(255)   NOT NULL,
        balance    NUMERIC(18,4)  NOT NULL DEFAULT 0,
        type       VARCHAR(50)    NULL,
        is_active  BOOLEAN        NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fa_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* ── erp_financial_entry ───────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_entry (
        id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id           UUID           NOT NULL,
        financial_account_id UUID           NULL,
        description          TEXT           NULL,
        amount               NUMERIC(18,4)  NOT NULL DEFAULT 0,
        type                 VARCHAR(50)    NULL,
        reference            VARCHAR(100)   NULL,
        entry_date           DATE           NULL,
        created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fe_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_fe_fin_account FOREIGN KEY (financial_account_id) REFERENCES erp_financial_account(id) ON DELETE SET NULL
      );
    `);

    /* ── erp_financial_posting ─────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_posting (
        id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        entry_id    UUID          NULL,
        amount      NUMERIC(18,4) NOT NULL DEFAULT 0,
        description TEXT          NULL,
        posted_at   TIMESTAMPTZ   NULL,
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fp_entry FOREIGN KEY (entry_id) REFERENCES erp_financial_entry(id) ON DELETE SET NULL
      );
    `);

    /* ── erp_financial_gateway_fee_rule ────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_gateway_fee_rule (
        id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255)   NOT NULL,
        percentage  NUMERIC(10,4)  NOT NULL DEFAULT 0,
        fixed_fee   NUMERIC(18,4)  NOT NULL DEFAULT 0,
        is_active   BOOLEAN        NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_transaction ───────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_transaction (
        id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id   UUID           NULL,
        event_id     UUID           NULL,
        amount       NUMERIC(18,4)  NOT NULL DEFAULT 0,
        status       VARCHAR(50)    NULL,
        reference    VARCHAR(100)   NULL,
        description  TEXT           NULL,
        created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_producer_payout ───────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_producer_payout (
        id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id   UUID           NULL,
        amount       NUMERIC(18,4)  NOT NULL DEFAULT 0,
        status       VARCHAR(50)    NULL,
        requested_at TIMESTAMPTZ    NULL,
        paid_at      TIMESTAMPTZ    NULL,
        created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_sales_sync_status ─────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_sales_sync_status (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id  UUID         NULL,
        synced_at   TIMESTAMPTZ  NULL,
        status      VARCHAR(50)  NULL,
        message     TEXT         NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_statement_organization ─────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_organization (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id   UUID         NULL,
        event_id     UUID         NULL,
        name         VARCHAR(255) NOT NULL,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ── erp_statement_producer ──────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_producer (
        id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id  UUID         NULL,
        name             VARCHAR(255) NOT NULL,
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_sp_org FOREIGN KEY (organization_id) REFERENCES erp_statement_organization(id) ON DELETE SET NULL
      );
    `);

    /* ── erp_two_factor ──────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_two_factor (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID         NOT NULL,
        secret     VARCHAR(255) NOT NULL,
        is_active  BOOLEAN      NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_2fa_user FOREIGN KEY (user_id) REFERENCES erp_user(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_two_factor CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_producer CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_organization CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_sales_sync_status CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_producer_payout CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_transaction CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_gateway_fee_rule CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_posting CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_entry CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_chart_of_accounts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_type CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_audit_log CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_product CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_product_category CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_event CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_bank_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_bank CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_user_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_role_permission CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_roles CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_user CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS account_level_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum;`);
  }
}
