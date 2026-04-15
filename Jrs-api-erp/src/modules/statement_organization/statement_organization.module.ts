import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementOrganizationController } from './statement_organization.controller';
import { StatementOrganizationEntity } from './entities/statement_organization.entity';
import { StatementOrganizationService } from './statement_organization.service';
import { TransactionModule } from '../transaction/transaction.module';
import { AuthModule } from '../auth/auth.module';
import { UserAccountEntity } from '../user_account/entities/user_account.entity';
import { RoleGuard } from 'src/guards/role.guard';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StatementOrganizationEntity, UserAccountEntity]),
    // TransactionModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [StatementOrganizationController],
  providers: [StatementOrganizationService, RoleGuard],
  exports: [StatementOrganizationService],
})
export class StatementOrganizationModule {}
