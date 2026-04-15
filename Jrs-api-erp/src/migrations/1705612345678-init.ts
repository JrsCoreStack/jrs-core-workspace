import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1705612345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Account table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_level_enum') THEN
                    CREATE TYPE account_level_enum AS ENUM ('MASTER', 'OPERATIONAL');
                END IF;
            END
            $$;

            CREATE TABLE IF NOT EXISTS erp_account (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                type INT NOT NULL UNIQUE,
                level account_level_enum NOT NULL DEFAULT 'OPERATIONAL',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    // 2. User table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
                    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
                END IF;
            END
            $$;

            CREATE TABLE IF NOT EXISTS erp_user (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cpf VARCHAR(11) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                totp_secret VARCHAR(255) DEFAULT NULL,
                is2fa_enabled BOOLEAN NOT NULL DEFAULT false,
                last_login TIMESTAMP NULL,
                status user_status_enum NOT NULL DEFAULT 'ACTIVE',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    // 3. Roles table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'FINANCIAL', 'COMMERCIAL_MANAGER', 'COMMERCIAL');
                END IF;
            END
            $$;

            CREATE TABLE IF NOT EXISTS erp_roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name user_role_enum NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    // 4. Permissions table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_permissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                module VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    // 5. Role Permissions table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_role_permissions (
                role_id UUID NOT NULL,
                permission_id UUID NOT NULL,
                PRIMARY KEY (role_id, permission_id),
                CONSTRAINT "FK_ROLE_PERMISSIONS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "erp_roles"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_ROLE_PERMISSIONS_PERMISSION_ID" FOREIGN KEY ("permission_id") REFERENCES "erp_permissions"("id") ON DELETE CASCADE
            );
        `);

    // 6. User Account table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_user_account (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                account_id UUID NOT NULL,
                role_id UUID,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_USER_ID" FOREIGN KEY ("user_id") REFERENCES "erp_user"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_USER_ACCOUNT_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "erp_roles"("id") ON DELETE SET NULL
            );
        `);

    // 7. Audit Log table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS erp_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(100) NOT NULL,
        record_id UUID NOT NULL,
        operation VARCHAR(20) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        changed_fields TEXT[],
        user_id UUID,
        account_id UUID NOT NULL,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Financial Chart of Accounts table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_chart_of_accounts_type_enum') THEN
                    CREATE TYPE financial_chart_of_accounts_type_enum AS ENUM ('INCOME', 'EXPENSE', 'ASSET', 'LIABILITY');
                END IF;
            END
            $$;

            CREATE TABLE IF NOT EXISTS erp_financial_chart_of_accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id UUID NOT NULL,
                code VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                type financial_chart_of_accounts_type_enum NOT NULL,
                parent_id UUID,
                active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_CHART_OF_ACCOUNTS_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_CHART_OF_ACCOUNTS_PARENT_ID" FOREIGN KEY ("parent_id") REFERENCES "erp_financial_chart_of_accounts"("id") ON DELETE SET NULL
            );
        `);

    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_external_source_enum') THEN
                    CREATE TYPE financial_external_source_enum AS ENUM ('EVENT_ADMIN_WEB', 'EVENT_SITE_WEB', 'EVENT_ADMIN_APP', 'PLAY_ADMIN_WEB', 'PLAY_ADMIN_APP', 'ERP');
                END IF;
            END
            $$;
        `);

    // 9. Financial Accounts table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_account_type_enum') THEN
                    CREATE TYPE financial_account_type_enum AS ENUM ('BANK', 'GATEWAY', 'CASH', 'PIX', 'OTHER');
                END IF;
            END
            $$;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_financial_accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                type financial_account_type_enum NOT NULL,
                currency CHAR(3) NOT NULL DEFAULT 'BRL',
                initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
                active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_FINANCIAL_ACCOUNTS_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_FINANCIAL_ACCOUNTS_ACCOUNT_NAME" UNIQUE ("account_id", "name")
            );
        `);

    // 10. Financial Entries table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_entry_type_enum') THEN
                    CREATE TYPE financial_entry_type_enum AS ENUM ('CREDIT', 'DEBIT');
                END IF;
            END
            $$;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_financial_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id UUID NOT NULL,
                chart_of_account_id UUID NOT NULL,
                type financial_entry_type_enum NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                description VARCHAR(500) NOT NULL,
                reference_id VARCHAR(255),
                reference_type VARCHAR(100),
                external_source VARCHAR(100) NOT NULL,
                entry_date TIMESTAMP NOT NULL,
                payment_method VARCHAR(50),
                event_name VARCHAR(255),
                event_id VARCHAR(255),
                installments INTEGER,
                card_brand VARCHAR(50),
                payment_id VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_FINANCIAL_ENTRIES_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID" FOREIGN KEY ("chart_of_account_id") REFERENCES "erp_financial_chart_of_accounts"("id") ON DELETE CASCADE
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_ENTRIES_ACCOUNT_ID" 
            ON erp_financial_entries (account_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID" 
            ON erp_financial_entries (chart_of_account_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_ENTRIES_ENTRY_DATE" 
            ON erp_financial_entries (entry_date);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_ENTRIES_PAYMENT_METHOD" 
            ON erp_financial_entries (payment_method);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_ENTRIES_EVENT_ID" 
            ON erp_financial_entries (event_id);
        `);

    // 12. Financial Payouts table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_financial_payouts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id UUID NOT NULL,
                event_id VARCHAR(255),
                event_name VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL,
                description TEXT,
                financial_entry_id UUID,
                payment_receiver VARCHAR(255),
                payment_key VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_FINANCIAL_PAYOUTS_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_FINANCIAL_PAYOUTS_FINANCIAL_ENTRY_ID" FOREIGN KEY ("financial_entry_id") REFERENCES "erp_financial_entries"("id") ON DELETE SET NULL
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_PAYOUTS_ACCOUNT_ID" 
            ON erp_financial_payouts (account_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_PAYOUTS_EVENT_ID" 
            ON erp_financial_payouts (event_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_FINANCIAL_PAYOUTS_FINANCIAL_ENTRY_ID" 
            ON erp_financial_payouts (financial_entry_id);
        `);

    // 11. Financial Gateway Fee Rules table
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_card_brand_enum') THEN
                    CREATE TYPE financial_card_brand_enum AS ENUM ('Visa', 'MasterCard', 'Elo', 'Amex', 'Hipercard', 'Picpay');
                END IF;
            END
            $$;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_financial_gateway_fee_rules (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                account_id UUID NOT NULL,
                gateway VARCHAR(50) NOT NULL,
                payment_method VARCHAR(20) NOT NULL,
                card_brand financial_card_brand_enum,
                installments INTEGER,
                percentage_fee DECIMAL(6,4) NOT NULL,
                fixed_fee DECIMAL(10,2) DEFAULT 0,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT "FK_GATEWAY_FEE_RULES_ACCOUNT_ID" FOREIGN KEY ("account_id") REFERENCES "erp_account"("id") ON DELETE CASCADE
            );
        `);

    // 13. Product Category table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_product_category (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_category_name ON erp_product_category(name);
        `);

    // 14. Product table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_product (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT NULL,
                category_id UUID NULL,
                cost_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
                unit_sale_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
                is_recurring BOOLEAN NOT NULL DEFAULT false,
                max_discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT fk_product_category 
                    FOREIGN KEY (category_id) 
                    REFERENCES erp_product_category(id) 
                    ON DELETE SET NULL
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_category_id ON erp_product(category_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_name ON erp_product(name);
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_is_active ON erp_product(is_active);
        `);

    // 15. Sales Sync Status table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS erp_sales_sync_status (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                sync_type VARCHAR(100) NOT NULL UNIQUE,
                last_synced_id BIGINT NULL,
                last_synced_date TIMESTAMP NULL,
                total_synced INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_sales_sync_status_sync_type ON erp_sales_sync_status(sync_type);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_financial_gateway_fee_rules;
            DROP TYPE IF EXISTS financial_card_brand_enum;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_FINANCIAL_ENTRIES_ENTRY_DATE";
            DROP INDEX IF EXISTS "IDX_FINANCIAL_ENTRIES_CHART_OF_ACCOUNTS_ID";
            DROP INDEX IF EXISTS "IDX_FINANCIAL_ENTRIES_ACCOUNT_ID";
            DROP TABLE IF EXISTS erp_financial_entries;
            DROP TYPE IF EXISTS financial_entry_type_enum;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_financial_accounts;
            DROP TYPE IF EXISTS financial_account_type_enum;
        `);

    await queryRunner.query(`
            DROP TYPE IF EXISTS financial_external_source_enum;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_financial_chart_of_accounts;
            DROP TYPE IF EXISTS financial_chart_of_accounts_type_enum;
        `);

    await queryRunner.query(`DROP TABLE IF EXISTS erp_audit_log;`);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_user_account;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_role_permissions;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_permissions;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_roles;
            DROP TYPE IF EXISTS user_role_enum;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_user;
            DROP TYPE IF EXISTS user_status_enum;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_financial_payouts;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_sales_sync_status_sync_type;
            DROP TABLE IF EXISTS erp_sales_sync_status;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_product_is_active;
            DROP INDEX IF EXISTS idx_product_name;
            DROP INDEX IF EXISTS idx_product_category_id;
            DROP TABLE IF EXISTS erp_product;
        `);

    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_product_category_name;
            DROP TABLE IF EXISTS erp_product_category;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS erp_account;
            DROP TYPE IF EXISTS account_level_enum;
        `);
  }
}
