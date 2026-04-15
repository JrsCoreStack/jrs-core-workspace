import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialAccountService } from './financial_account.service';
import { CreateFinancialAccountDTO } from './dtos/create';
import { FinancialAccountEntity } from './entities/financial_account.entity';

@ApiTags('Financeiro – Contas')
@ApiBearerAuth()
@Controller('financial_accounts')
export class FinancialAccountController {
    constructor(
        private readonly financialAccountService: FinancialAccountService,
    ) { }

    @Post()
    async create(
        @Body() createFinancialAccount: CreateFinancialAccountDTO,
    ): Promise<FinancialAccountEntity> {
        return this.financialAccountService.create(createFinancialAccount);
    }

    @Get()
    async findAll(): Promise<FinancialAccountEntity[]> {
        return this.financialAccountService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<FinancialAccountEntity> {
        return this.financialAccountService.findById(id);
    }

    @Get('account/:account_id')
    async findByAccountId(
        @Param('account_id') account_id: string,
    ): Promise<FinancialAccountEntity[]> {
        return this.financialAccountService.findByAccountId(account_id);
    }
}
