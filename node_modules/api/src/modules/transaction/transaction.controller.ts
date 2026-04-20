import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDTO } from './dtos/create';
import { TransactionEntity } from './entities/transaction.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';

@ApiExcludeController()
@ApiTags('Transa??es')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Body() createTransaction: CreateTransactionDTO,
  ): Promise<TransactionEntity> {
    return this.transactionService.create(createTransaction);
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get()
  async findAll(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('bank_id') bank_id?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('payment_id') payment_id?: string,
    @Query('payment_status') payment_status?: number[] | number,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('payment_method') payment_method?: string,
  ): Promise<{
    data: TransactionEntity[];
    total: number;
  }> {
    return this.transactionService.findAll(
      account_id,
      event_id,
      bank_id,
      limit,
      offset,
      payment_id,
      payment_status,
      start_date,
      end_date,
      payment_method,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('status')
  async findStatusSales(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<{
    [key: string]: {
      total_sales: number;
      total_sales_percentage: number;
    };
  }> {
    return this.transactionService.findStatusSales(
      account_id,
      event_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('payment_methods')
  async findPaymentMethodsSales(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<{
    [key: string]: {
      total_sales: number;
      total_sales_percentage: number;
    };
  }> {
    return this.transactionService.findPaymentMethodsSales(
      account_id,
      event_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('installments')
  async findInstallmentSales(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<{
    total_sales_quantity: number;
    total_sales_expense_value: number;
    total_sales_revenue_value: number;
  }> {
    return this.transactionService.findInstallmentsSales(
      account_id,
      event_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get('total')
  async findTotalTransactions(
    @CurrentAccountId() account_id: string,
    @Query('event_id') event_id?: string,
    @Query('bank_id') bank_id?: string,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ): Promise<{
    gross_total: number;
    net_total: number;
    quantity: number;
  }> {
    return this.transactionService.findTotalTransactions(
      account_id,
      event_id,
      bank_id,
      start_date,
      end_date,
    );
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get(':id')
  async findById(
    @CurrentAccountId() account_id: string,
    @Param('id') id: string,
  ): Promise<{
    data: TransactionEntity;
    bank_fee: number;
    bank_spread: number;
    product_value: number;
    total_net: number;
  }> {
    return this.transactionService.findById(account_id, id);
  }
}
