import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { seedChartOfAccounts } from './chart_of_accounts.seed';
import { seedAccounts } from './accounts.seed';
import { seedFinancialGatewayFeeRules } from './financial_gateway_fee_rules.seed';
import { seedRolesAndPermissions } from './roles_and_permissions.seed';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  // Seed roles e permissions primeiro
  await seedRolesAndPermissions(dataSource);

  const accounts = await seedAccounts(dataSource);

  await seedChartOfAccounts(dataSource, accounts.contaVendasExterna.id);
  await seedChartOfAccounts(dataSource, accounts.oticketPlay.id);

  await seedFinancialGatewayFeeRules(dataSource, accounts.contaVendasExterna.id);
  // await seedFinancialGatewayFeeRules(dataSource, accounts.oticketPlay.id);

  await app.close();
}

runSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
