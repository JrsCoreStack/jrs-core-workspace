import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration inicial — cria todas as tabelas base do JRS ERP.
 * Usa CREATE TABLE IF NOT EXISTS e DO $$ ... END $$ para ser segura
 * em bancos que já possuam as tabelas (re-executar não gera erro).
 */
export class InitBaseTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* ══════════════════════════════════════════════════════════
       1. ENUMS
    ══════════════════════════════════════════════════════════ */
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

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE financial_account_type_enum AS ENUM ('BANK', 'GATEWAY', 'CASH', 'PIX', 'OTHER');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE financial_entry_type_enum AS ENUM ('CREDIT', 'DEBIT');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE chart_of_accounts_type_enum AS ENUM ('INCOME', 'EXPENSE', 'ASSET', 'LIABILITY');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE financial_card_brand_enum AS ENUM ('Visa', 'MasterCard', 'Elo', 'Amex', 'Hipercard', 'Picpay');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    /* ══════════════════════════════════════════════════════════
       2. TABELAS SEM DEPENDÊNCIAS
    ══════════════════════════════════════════════════════════ */

    /* erp_user ──────────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_user (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name           VARCHAR(255)      NOT NULL,
        cpf            VARCHAR(11)       NOT NULL UNIQUE,
        email          VARCHAR(255)      NOT NULL UNIQUE,
        phone          VARCHAR(15)       NOT NULL,
        password       VARCHAR(255)      NOT NULL,
        totp_secret    VARCHAR(255)      NULL DEFAULT NULL,
        is2fa_enabled  BOOLEAN           NOT NULL DEFAULT false,
        last_login     TIMESTAMP         NULL DEFAULT NULL,
        status         user_status_enum  NOT NULL DEFAULT 'ACTIVE',
        created_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_account ───────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_account (
        id         UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255)         NOT NULL,
        code       VARCHAR(255)         NOT NULL,
        email      VARCHAR(255)         NOT NULL UNIQUE,
        type       INTEGER              NOT NULL UNIQUE,
        level      account_level_enum   NOT NULL DEFAULT 'OPERATIONAL',
        created_at TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ          NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_bank ──────────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_bank (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_roles ─────────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_roles (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        name        user_role_enum  NOT NULL UNIQUE,
        description TEXT            NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_permissions ───────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_permissions (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT         NULL,
        module      VARCHAR(50)  NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_statement_type ────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_type (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255) NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_product_category ──────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_product_category (
        id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_audit_log ─────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_audit_log (
        id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name     VARCHAR(255) NOT NULL,
        record_id      VARCHAR(255) NOT NULL,
        operation      VARCHAR(10)  NOT NULL,
        old_values     JSONB        NULL,
        new_values     JSONB        NULL,
        changed_fields TEXT[]       NULL,
        user_id        VARCHAR(255) NULL,
        account_id     VARCHAR(255) NOT NULL,
        ip_address     VARCHAR(255) NULL,
        user_agent     TEXT         NULL,
        timestamp      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_sales_sync_status ─────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_sales_sync_status (
        id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        sync_type        VARCHAR(100) NOT NULL UNIQUE,
        last_synced_id   BIGINT       NULL,
        last_synced_date TIMESTAMP    NULL,
        total_synced     INTEGER      NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* ══════════════════════════════════════════════════════════
       3. TABELAS COM DEPENDÊNCIAS
    ══════════════════════════════════════════════════════════ */

    /* erp_user_account ──────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_user_account (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID        NOT NULL,
        account_id UUID        NOT NULL,
        role_id    UUID        NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_user_account_user    FOREIGN KEY (user_id)    REFERENCES erp_user(id)    ON DELETE CASCADE,
        CONSTRAINT fk_user_account_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_account_role    FOREIGN KEY (role_id)    REFERENCES erp_roles(id)   ON DELETE SET NULL
      );
    `);

    /* erp_role_permissions ──────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_role_permissions (
        role_id       UUID NOT NULL,
        permission_id UUID NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES erp_roles(id)       ON DELETE CASCADE,
        CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES erp_permissions(id) ON DELETE CASCADE
      );
    `);

    /* erp_bank_account ──────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_bank_account (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID        NOT NULL,
        bank_id    UUID        NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_bank_account_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_bank_account_bank    FOREIGN KEY (bank_id)    REFERENCES erp_bank(id)    ON DELETE CASCADE
      );
    `);

    /* erp_two_factor ────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_two_factor (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID        NOT NULL,
        secret     VARCHAR(255) NOT NULL,
        is_enabled BOOLEAN     NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_two_factor_user FOREIGN KEY (user_id) REFERENCES erp_user(id) ON DELETE CASCADE
      );
    `);

    /* erp_event ─────────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_event (
        id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        id_reference INTEGER     NOT NULL,
        name         VARCHAR(255) NOT NULL,
        account_id   UUID        NOT NULL,
        start_date   TIMESTAMP   NOT NULL,
        end_date     TIMESTAMP   NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_event_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* erp_transaction ───────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_transaction (
        id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id             UUID         NOT NULL,
        bank_id              UUID         NOT NULL,
        sale_id              INTEGER      NOT NULL,
        payment_method       VARCHAR(50)  NOT NULL,
        payment_installments INTEGER      NULL,
        payment_id           VARCHAR(255) NOT NULL,
        payment_status       INTEGER      NOT NULL,
        total                DECIMAL(10,2) NOT NULL,
        created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_transaction_event FOREIGN KEY (event_id) REFERENCES erp_event(id) ON DELETE CASCADE,
        CONSTRAINT fk_transaction_bank  FOREIGN KEY (bank_id)  REFERENCES erp_bank(id)  ON DELETE CASCADE
      );
    `);

    /* erp_statement_organization ────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_organization (
        id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id    UUID         NOT NULL,
        account_id        UUID         NOT NULL,
        event_id          UUID         NOT NULL,
        statement_type_id UUID         NOT NULL,
        amount            DECIMAL(10,2) NOT NULL,
        type              VARCHAR(50)  NOT NULL,
        created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_stmt_org_transaction    FOREIGN KEY (transaction_id)    REFERENCES erp_transaction(id)    ON DELETE CASCADE,
        CONSTRAINT fk_stmt_org_event          FOREIGN KEY (event_id)          REFERENCES erp_event(id)          ON DELETE CASCADE,
        CONSTRAINT fk_stmt_org_statement_type FOREIGN KEY (statement_type_id) REFERENCES erp_statement_type(id) ON DELETE CASCADE,
        CONSTRAINT fk_stmt_org_account        FOREIGN KEY (account_id)        REFERENCES erp_account(id)        ON DELETE CASCADE
      );
    `);

    /* erp_statement_producer ────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_statement_producer (
        id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id    UUID         NOT NULL,
        account_id        UUID         NOT NULL,
        event_id          UUID         NOT NULL,
        statement_type_id UUID         NOT NULL,
        amount            DECIMAL(10,2) NOT NULL,
        type              VARCHAR(50)  NOT NULL,
        created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_stmt_prod_transaction    FOREIGN KEY (transaction_id)    REFERENCES erp_transaction(id)    ON DELETE CASCADE,
        CONSTRAINT fk_stmt_prod_event          FOREIGN KEY (event_id)          REFERENCES erp_event(id)          ON DELETE CASCADE,
        CONSTRAINT fk_stmt_prod_statement_type FOREIGN KEY (statement_type_id) REFERENCES erp_statement_type(id) ON DELETE CASCADE,
        CONSTRAINT fk_stmt_prod_account        FOREIGN KEY (account_id)        REFERENCES erp_account(id)        ON DELETE CASCADE
      );
    `);

    /* erp_financial_chart_of_accounts ───────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_chart_of_accounts (
        id         UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID                       NOT NULL,
        code       VARCHAR(255)               NOT NULL,
        name       VARCHAR(255)               NOT NULL,
        type       chart_of_accounts_type_enum NOT NULL,
        parent_id  UUID                       NULL,
        active     BOOLEAN                    NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_chart_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE,
        CONSTRAINT fk_chart_parent  FOREIGN KEY (parent_id)  REFERENCES erp_financial_chart_of_accounts(id) ON DELETE SET NULL
      );
    `);

    /* erp_financial_accounts ────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_accounts (
        id              UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id      UUID                        NOT NULL,
        name            VARCHAR(255)                NOT NULL,
        type            financial_account_type_enum NOT NULL,
        currency        CHAR(3)                     NOT NULL DEFAULT 'BRL',
        initial_balance DECIMAL(15,2)               NOT NULL DEFAULT 0,
        active          BOOLEAN                     NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fin_account_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* erp_financial_entries ─────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_entries (
        id                  UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id          UUID                      NOT NULL,
        chart_of_account_id UUID                      NOT NULL,
        type                financial_entry_type_enum NOT NULL,
        amount              DECIMAL(15,2)              NOT NULL,
        description         VARCHAR(500)               NOT NULL,
        reference_id        VARCHAR(255)               NULL,
        reference_type      VARCHAR(100)               NULL,
        external_source     VARCHAR(100)               NOT NULL,
        entry_date          TIMESTAMP                  NOT NULL,
        payment_method      VARCHAR(50)                NULL,
        event_name          VARCHAR(255)               NULL,
        event_id            VARCHAR(255)               NULL,
        installments        INTEGER                    NULL,
        card_brand          VARCHAR(50)                NULL,
        payment_id          VARCHAR(255)               NULL,
        created_at          TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fin_entries_account   FOREIGN KEY (account_id)          REFERENCES erp_account(id)                      ON DELETE CASCADE,
        CONSTRAINT fk_fin_entries_chart     FOREIGN KEY (chart_of_account_id) REFERENCES erp_financial_chart_of_accounts(id)  ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_ENTRIES_ACCOUNT_ID          ON erp_financial_entries(account_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID ON erp_financial_entries(chart_of_account_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_ENTRIES_ENTRY_DATE            ON erp_financial_entries(entry_date);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_ENTRIES_PAYMENT_METHOD        ON erp_financial_entries(payment_method);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_ENTRIES_EVENT_ID              ON erp_financial_entries(event_id);`);

    /* erp_financial_gateway_fee_rules ───────────────────────── */
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE financial_card_brand_enum AS ENUM ('Visa', 'MasterCard', 'Elo', 'Amex', 'Hipercard', 'Picpay');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_gateway_fee_rules (
        id              UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id      UUID                       NOT NULL,
        gateway         VARCHAR(50)                NOT NULL,
        payment_method  VARCHAR(20)                NOT NULL,
        card_brand      financial_card_brand_enum  NULL,
        installments    INTEGER                    NULL,
        percentage_fee  DECIMAL(6,4)               NOT NULL,
        fixed_fee       DECIMAL(10,2)              NOT NULL DEFAULT 0,
        active          BOOLEAN                    NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_fee_rule_account FOREIGN KEY (account_id) REFERENCES erp_account(id) ON DELETE CASCADE
      );
    `);

    /* erp_financial_payouts ─────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_payouts (
        id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id        UUID         NOT NULL,
        event_id          VARCHAR(255) NULL,
        event_name        VARCHAR(255) NULL,
        amount            DECIMAL(10,2) NOT NULL,
        description       TEXT         NULL,
        financial_entry_id UUID        NULL,
        payment_receiver  VARCHAR(255) NULL,
        payment_key       VARCHAR(50)  NULL,
        created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_payout_account FOREIGN KEY (account_id)         REFERENCES erp_account(id)          ON DELETE CASCADE,
        CONSTRAINT fk_payout_entry   FOREIGN KEY (financial_entry_id) REFERENCES erp_financial_entries(id) ON DELETE SET NULL
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_PAYOUTS_ACCOUNT_ID         ON erp_financial_payouts(account_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_PAYOUTS_EVENT_ID            ON erp_financial_payouts(event_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_FINANCIAL_PAYOUTS_FINANCIAL_ENTRY_ID  ON erp_financial_payouts(financial_entry_id);`);

    /* erp_financial_posting ─────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_financial_posting (
        id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id          UUID         NULL,
        financial_entry_id  UUID         NULL,
        external_ref        VARCHAR(255) NULL,
        status              VARCHAR(50)  NOT NULL DEFAULT 'pending',
        payload             JSONB        NULL,
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    /* erp_product ───────────────────────────────────────────── */
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_product (
        id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name                  VARCHAR(255) NOT NULL,
        description           TEXT         NULL,
        category_id           UUID         NULL,
        cost_value            DECIMAL(15,2) NOT NULL DEFAULT 0,
        unit_sale_value       DECIMAL(15,2) NOT NULL DEFAULT 0,
        is_recurring          BOOLEAN      NOT NULL DEFAULT false,
        max_discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        is_active             BOOLEAN      NOT NULL DEFAULT true,
        created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES erp_product_category(id) ON DELETE SET NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS erp_product CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_product_category CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_posting CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_payouts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_gateway_fee_rules CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_entries CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_accounts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_financial_chart_of_accounts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_producer CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_organization CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_transaction CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_event CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_two_factor CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_bank_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_role_permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_user_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_sales_sync_status CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_audit_log CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_statement_type CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_roles CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_bank CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_account CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS erp_user CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS financial_card_brand_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS chart_of_accounts_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS financial_entry_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS financial_account_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS account_level_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum;`);
  }
}
