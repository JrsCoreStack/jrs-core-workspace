import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialPostingService } from './financial_posting.service';
import { CreateTicketSaleDTO } from './dtos/create-ticket-sale.dto';

@ApiTags('Financeiro – Postagens')
@ApiBearerAuth()
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
