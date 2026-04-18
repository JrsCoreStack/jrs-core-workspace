import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local' });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: Number(configService.get('DB_PORT')),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  ssl: configService.get('DB_SSL') === 'true'
        ? {
          rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
          // opcional: ca: readFileSync(process.env.DB_SSL_CA_PATH!, 'utf8'),
        }
        : false,
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
  logging: true,
});
