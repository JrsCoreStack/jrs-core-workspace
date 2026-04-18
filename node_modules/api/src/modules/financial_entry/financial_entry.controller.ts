import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialEntryService } from './financial_entry.service';
import { FinancialEntryEntity } from './entities/financial_entry.entity';
import { ListFinancialEntriesQueryDTO } from './dtos/list-query.dto';

@ApiTags('Financeiro – Lançamentos')
@ApiBearerAuth()
@Controller('financial_entry')
export class FinancialEntryController {
    constructor(
        private readonly financialEntryService: FinancialEntryService,
    ) { }

    @Get()
    async findAll(): Promise<FinancialEntryEntity[]> {
        return this.financialEntryService.findAll();
    }

    @Get('transactions')
    async findAllPaginated(
        @Query() query: ListFinancialEntriesQueryDTO,
    ): Promise<{
        data: FinancialEntryEntity[] | Array<{
            reference_id: string | null;
            total: number;
            transaction_count: number;
            date: string;
            transactions: FinancialEntryEntity[];
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        consolidated?: {
            total_revenue: number;
            total_expenses: number;
            total_liabilities: number;
            profit: number;
        };
    }> {
        return this.financialEntryService.findAllPaginated(query);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<FinancialEntryEntity> {
        return this.financialEntryService.findById(id);
    }

    @Get('stats/:account_id')
    async findFinancialStats(
        @Param('account_id') account_id: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
    ): Promise<{
        revenue: number;
        cost: number;
        profit: number;
    }> {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;

        return this.financialEntryService.findFinancialStats(
            account_id,
            startDate,
            endDate,
        );
    }

    @Get('account/:account_id')
    async findByAccountId(
        @Param('account_id') account_id: string,
    ): Promise<FinancialEntryEntity[]> {
        return this.financialEntryService.findByAccountId(account_id);
    }

    @Get('events/balances')
    async getEventBalances(
        @Query('account_id') account_id?: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
        @Query('event_id') event_id?: string,
        @Query('event_name') event_name?: string,
    ): Promise<Array<{
        event_id: string | null;
        event_name: string | null;
        balance: number;
        transaction_count: number;
        first_transaction_date: string | null;
        last_transaction_date: string | null;
    }>> {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;

        return this.financialEntryService.getEventBalances(
            account_id,
            startDate,
            endDate,
            event_id,
            event_name,
        );
    }

    @Get('events/financial-balance')
    async getEventFinancialBalance(
        @Query('account_id') account_id?: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
        @Query('event_id') event_id?: string,
        @Query('event_name') event_name?: string,
    ): Promise<Array<{
        event_id: string | null;
        event_name: string | null;
        total_revenue: number;
        total_expenses: number;
        total_liabilities: number;
        total_repaid: number;
        pending_balance: number;
        balance: number;
        transaction_count: number;
        first_transaction_date: string | null;
        last_transaction_date: string | null;
    }>> {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;

        return this.financialEntryService.getEventFinancialBalance(
            account_id,
            startDate,
            endDate,
            event_id,
            event_name,
        );
    }

    @Get('events/financial-balance/summary')
    async getEventFinancialBalanceSummary(
        @Query('account_id') account_id?: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
        @Query('event_id') event_id?: string,
        @Query('event_name') event_name?: string,
    ): Promise<{
        total_revenue: number;
        total_expenses: number;
        total_liabilities: number;
        total_repaid: number;
        total_pending_balance: number;
        total_balance: number;
        event_count: number;
        total_transaction_count: number;
    }> {
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;

        return this.financialEntryService.getEventFinancialBalanceSummary(
            account_id,
            startDate,
            endDate,
            event_id,
            event_name,
        );
    }
}
