import { Body, Controller, Post } from '@nestjs/common';
import { FinancialPostingService } from './financial_posting.service';
import { CreateTicketSaleDTO } from './dtos/create-ticket-sale.dto';

@Controller('financial_posting')
export class FinancialPostingController {
    constructor(
        private readonly financialPostingService: FinancialPostingService,
    ) { }

    @Post('ticket-online-sale')
    async createTicketOnlineSale(
        @Body() data: CreateTicketSaleDTO,
    ): Promise<CreateTicketSaleDTO> {
        return this.financialPostingService.createTicketOnlineSale(data);
    }
}
