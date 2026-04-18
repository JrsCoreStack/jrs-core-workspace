import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialEntryService } from './financial_entry.service';
import { FinancialEntryController } from './financial_entry.controller';
import { FinancialEntryEntity } from './entities/financial_entry.entity';
import { AccountEntity } from '../account/entities/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FinancialEntryEntity, AccountEntity])],
    controllers: [FinancialEntryController],
    providers: [FinancialEntryService],
    exports: [FinancialEntryService],
})
export class FinancialEntryModule { }
