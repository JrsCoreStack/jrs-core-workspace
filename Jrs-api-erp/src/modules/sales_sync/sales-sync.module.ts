import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesSyncService } from './sales-sync.service';
import { SalesSyncController } from './sales-sync.controller';
import { SalesSyncStatusEntity } from './entities/sales-sync-status.entity';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { FinancialPostingModule } from '../financial_posting/financial_posting.module';
import { FinancialEntryModule } from '../financial_entry/financial_entry.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesSyncStatusEntity, FinancialEntryEntity]),
    FinancialPostingModule,
    FinancialEntryModule,
    AuthModule,
  ],
  controllers: [SalesSyncController],
  providers: [SalesSyncService],
  exports: [SalesSyncService],
})
export class SalesSyncModule {}
