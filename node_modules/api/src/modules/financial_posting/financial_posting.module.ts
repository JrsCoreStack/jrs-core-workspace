import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialPostingController } from './financial_posting.controller';
import { FinancialPostingService } from './financial_posting.service';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { FinancialChartOfAccountsModule } from '../financial_chart_of_accounts/financial_chart_of_accounts.module';
import { AccountModule } from '../account/account.module';
import { FinancialGatewayFeeRuleModule } from '../financial_gateway_fee_rule/financial_gateway_fee_rule.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([FinancialEntryEntity]),
        FinancialChartOfAccountsModule,
        AccountModule,
        FinancialGatewayFeeRuleModule,
    ],
    controllers: [FinancialPostingController],
    providers: [FinancialPostingService],
    exports: [FinancialPostingService],
})
export class FinancialPostingModule { }
