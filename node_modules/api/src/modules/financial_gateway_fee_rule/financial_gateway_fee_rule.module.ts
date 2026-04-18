import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialGatewayFeeRuleEntity } from './entities/financial_gateway_fee_rule.entity';
import { FinancialGatewayFeeRuleController } from './financial_gateway_fee_rule.controller';
import { FinancialGatewayFeeRuleService } from './financial_gateway_fee_rule.service';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialGatewayFeeRuleEntity]),
    AccountModule,
  ],
  controllers: [FinancialGatewayFeeRuleController],
  providers: [FinancialGatewayFeeRuleService],
  exports: [FinancialGatewayFeeRuleService],
})
export class FinancialGatewayFeeRuleModule {}
