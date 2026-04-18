import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { EventModule } from '../event/event.module';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { StatementOrganizationModule } from '../statement_organization/statement_organization.module';
import { StatementProducerModule } from '../statement_producer/statement_producer.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    EventModule,
    AccountModule,
    AuthModule,
    StatementOrganizationModule,
    StatementProducerModule,
    AuditModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
