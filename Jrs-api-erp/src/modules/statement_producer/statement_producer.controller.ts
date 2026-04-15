import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';
import { StatementProducerService } from './statement_producer.service';
import { StatementProducerEntity } from './entities/statement_producer.entity';
import { CreateStatementProducerDTO } from './dtos/create';

@Controller('statement_producer')
export class StatementProducerController {
  constructor(
    private readonly statementProducerService: StatementProducerService,
  ) {}

  @UseGuards(AuthGuard, AccountGuard)
  @Post()
  async create(
    @CurrentAccountId() account_id: string,
    @Body() createStatement: CreateStatementProducerDTO,
  ): Promise<StatementProducerEntity> {
    return this.statementProducerService.create(account_id, createStatement);
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('/totals/net')
  async totalNetByTransaction(
    @CurrentAccountId() account_id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('statement_type_names') statement_type_names?: string[],
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ): Promise<{
    data: { transaction_id: string; total: number }[];
    total: number;
  }> {
    return this.statementProducerService.totalNetByTransaction(
      account_id,
      limit,
      offset,
      statement_type_names,
      start_date,
      end_date,
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
    return this.statementProducerService.totalRevenue(
      account_id,
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
    data: StatementProducerEntity[];
    total: number;
  }> {
    return this.statementProducerService.findAll(account_id, limit, offset);
  }
}
