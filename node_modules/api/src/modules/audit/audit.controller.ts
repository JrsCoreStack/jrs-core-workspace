import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuthGuard } from '../../guards/auth.guard';
import { AccountGuard } from '../../guards/account.guard';
import { RoleGuard } from '../../guards/role.guard';
import { CurrentAccountId } from '../../decorators/account.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUserId } from '../../decorators/user.decorator';

@ApiTags('Auditoria')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(AuthGuard, AccountGuard, RoleGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('/account')
  // @Roles(UserAccountRole.ADMIN)
  async getAuditByAccount(
    @CurrentAccountId() accountId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.auditService.getAuditByAccount(
      accountId,
      limit || 100,
      offset || 0,
    );
  }

  @Get('/user')
  // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
  async getAuditByUser(
    @CurrentUserId() userId: string,
    @CurrentAccountId() accountId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.auditService.getAuditByUser(
      userId,
      accountId,
      limit || 100,
      offset || 0,
    );
  }

  @Get('/record/:tableName/:recordId')
  // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
  async getAuditHistory(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
    @CurrentAccountId() accountId: string,
  ) {
    return this.auditService.getAuditHistory(tableName, recordId, accountId);
  }
}
