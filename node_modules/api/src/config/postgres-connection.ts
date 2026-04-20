import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

/**
 * Monta opções de conexão Postgres para TypeORM.
 * Preferência: `DATABASE_URL` (Neon, Railway, etc.); senão `DB_*` separadas.
 */
export function getPostgresConnectionOptions(
  get: (key: string) => string | undefined,
): Pick<
  PostgresConnectionOptions,
  'type' | 'url' | 'host' | 'port' | 'username' | 'password' | 'database' | 'ssl'
> {
  const databaseUrl = get('DATABASE_URL')?.trim();
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
    };
  }

  const portRaw = get('DB_PORT');
  const port = portRaw ? Number(portRaw) : 5432;

  const sslEnabled = get('DB_SSL') === 'true';

  return {
    type: 'postgres',
    host: get('DB_HOST'),
    port: Number.isFinite(port) ? port : 5432,
    username: get('DB_USERNAME'),
    password: get('DB_PASSWORD'),
    database: get('DB_DATABASE'),
    ssl: sslEnabled
      ? {
          rejectUnauthorized: get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
        }
      : false,
  };
}
