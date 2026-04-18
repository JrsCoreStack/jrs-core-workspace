import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProducerPayoutService } from './producer_payout.service';
import { ProducerPayoutController } from './producer_payout.controller';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { ManualPayoutEntity } from './entities/manual_payout.entity';
import { AccountEntity } from '../account/entities/account.entity';
import { FinancialChartOfAccountsModule } from '../financial_chart_of_accounts/financial_chart_of_accounts.module';
import { AccountModule } from '../account/account.module';
import { FinancialEntryModule } from '../financial_entry/financial_entry.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([FinancialEntryEntity, ManualPayoutEntity, AccountEntity]),
    FinancialChartOfAccountsModule,
    AccountModule,
    FinancialEntryModule,
  ],
  controllers: [ProducerPayoutController],
  providers: [ProducerPayoutService],
  exports: [ProducerPayoutService],
})
export class ProducerPayoutModule {}
