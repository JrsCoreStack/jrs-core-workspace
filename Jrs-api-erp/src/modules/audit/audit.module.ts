import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from './entities/audit_log.entity';
import { AuditController } from './audit.controller';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../account/account.module';
import { UserAccountModule } from '../user_account/user_account.module';
import { UserAccountEntity } from '../user_account/entities/user_account.entity';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity, UserAccountEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => AccountModule),
    forwardRef(() => UserAccountModule),
  ],
  providers: [AuditService, RoleGuard],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
