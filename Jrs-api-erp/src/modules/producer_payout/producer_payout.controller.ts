import { Controller, Get, Put, Post, Param, Query, Body } from '@nestjs/common';
import { ProducerPayoutService } from './producer_payout.service';
import { PaymentRequestDTO } from './dtos/payment-request.dto';
import { MarkAsPaidDTO } from './dtos/payment-request.dto';
import { CreateManualPayoutDTO } from './dtos/create-manual-payout.dto';
import { ManualPayoutEntity } from './entities/manual_payout.entity';

@Controller('producer_payout')
export class ProducerPayoutController {
  constructor(
    private readonly producerPayoutService: ProducerPayoutService,
  ) {}

  @Get('requests')
  async getPaymentRequests(
    @Query('account_code') account_code?: string,
    @Query('event_id') event_id?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PaymentRequestDTO[]> {
    return this.producerPayoutService.fetchPaymentRequests({
      account_code,
      event_id,
      status: status || 'waiting_payment',
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Put('requests/:id/mark-as-paid')
  async markAsPaid(
    @Param('id') id: string,
    @Body() body: MarkAsPaidDTO,
  ): Promise<{ message: string }> {
    await this.producerPayoutService.markAsPaid(
      Number(id),
      body.account_code,
    );
    return { message: 'Repasse marcado como pago com sucesso' };
  }

  @Post('manual')
  async createManualPayout(
    @Body() body: CreateManualPayoutDTO,
  ): Promise<ManualPayoutEntity> {
    return this.producerPayoutService.createManualPayout(body);
  }
}
