import {
  Body,
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StatementOrganizationService } from './statement_organization.service';
import { CreateStatementOrganizationDTO } from './dtos/create';
import { StatementOrganizationEntity } from './entities/statement_organization.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('Extrato – Organização')
@ApiBearerAuth()
@Controller('statement_organization')
export class StatementOrganizationController {
  constructor(
    private readonly statementOrganizationService: StatementOrganizationService,
  ) {}

  @UseGuards(AuthGuard, AccountGuard)
  // @Roles(UserAccountRole.ADMIN, UserAccountRole.USER)
  @Post()
  async create(
    @CurrentAccountId() account_id: string,
    @Body() createStatement: CreateStatementOrganizationDTO,
  ): Promise<StatementOrganizationEntity> {
    return this.statementOrganizationService.create(
      account_id,
      createStatement,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('/totals/net')
  async totalNetByTransaction(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('bank_id') bank_id?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('statement_type_names') statement_type_names?: string[],
    @Query('payment_id') payment_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('isExport', new ParseBoolPipe({ optional: true }))
    isExport?: boolean,
  ): Promise<{
    data: { transaction_id: string; total: number }[];
    total: number;
  }> {
    return this.statementOrganizationService.totalNetByTransaction(
      account_id,
      event_id,
      bank_id,
      limit,
      offset,
      payment_id,
      statement_type_names,
      start_date,
      end_date,
      isExport,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('/revenue')
  async totalRevenue(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<number | null> {
    return this.statementOrganizationService.totalRevenue(
      account_id,
      event_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('/event/metrics')
  async metricsByEvent(
    @CurrentAccountId() account_id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('orderBy') order_by?: 'revenue' | 'income' | 'expense' | 'margin',
    @Query('event_name') event_name?: string,
    @Query('event_id') event_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<{
    data: {
      event_id: string;
      event_name: string;
      start_date: Date;
      end_date: Date;
      total_income: number;
      total_expense: number;
      total_revenue: number;
      total_margin: number;
    }[];
    totals: {
      count: number;
      income: number;
      expense: number;
      revenue: number;
    };
  }> {
    return this.statementOrganizationService.metricsByEvent(
      account_id,
      limit,
      offset,
      order_by,
      event_name,
      event_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get()
  async findAll(
    @CurrentAccountId() account_id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{
    data: StatementOrganizationEntity[];
    total: number;
  }> {
    return this.statementOrganizationService.findAll(account_id, limit, offset);
  }
}
