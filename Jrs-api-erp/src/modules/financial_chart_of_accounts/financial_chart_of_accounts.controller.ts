import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { FinancialChartOfAccountsService } from './financial_chart_of_accounts.service';
import { CreateFinancialChartOfAccountsDTO } from './dtos/create';
import { FinancialChartOfAccountsEntity } from './entities/financial_chart_of_accounts.entity';

@ApiExcludeController()
@ApiTags('Financeiro ù Plano de Contas')
@ApiBearerAuth()
@Controller('financial_chart_of_accounts')
export class FinancialChartOfAccountsController {
  constructor(
    private readonly chartOfAccountsService: FinancialChartOfAccountsService,
  ) {}

  @Post()
  async create(
    @Body() createChartOfAccounts: CreateFinancialChartOfAccountsDTO,
  ): Promise<FinancialChartOfAccountsEntity> {
    return this.chartOfAccountsService.create(createChartOfAccounts);
  }

  @Get()
  async findAll(): Promise<FinancialChartOfAccountsEntity[]> {
    return this.chartOfAccountsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<FinancialChartOfAccountsEntity> {
    return this.chartOfAccountsService.findById(id);
  }

  @Get('account/:account_id')
  async findByAccountId(
    @Param('account_id') account_id: string,
  ): Promise<FinancialChartOfAccountsEntity[]> {
    return this.chartOfAccountsService.findByAccountId(account_id);
  }
}
