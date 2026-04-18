import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialAccountEntity } from './entities/financial_account.entity';
import { FinancialAccountController } from './financial_account.controller';
import { FinancialAccountService } from './financial_account.service';

@Module({
    imports: [TypeOrmModule.forFeature([FinancialAccountEntity])],
    controllers: [FinancialAccountController],
    providers: [FinancialAccountService],
    exports: [FinancialAccountService],
})
export class FinancialAccountModule { }
