import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialChartOfAccountsEntity } from './entities/financial_chart_of_accounts.entity';
import { FinancialChartOfAccountsController } from './financial_chart_of_accounts.controller';
import { FinancialChartOfAccountsService } from './financial_chart_of_accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialChartOfAccountsEntity])],
  controllers: [FinancialChartOfAccountsController],
  providers: [FinancialChartOfAccountsService],
  exports: [FinancialChartOfAccountsService],
})
export class FinancialChartOfAccountsModule {}
