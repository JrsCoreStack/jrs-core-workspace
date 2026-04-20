import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getPostgresConnectionOptions } from './postgres-connection';

config({ path: '.env' });
config({ path: '.env.local' });

export default new DataSource({
  ...getPostgresConnectionOptions((key) => process.env[key]),
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
  logging: true,
});
