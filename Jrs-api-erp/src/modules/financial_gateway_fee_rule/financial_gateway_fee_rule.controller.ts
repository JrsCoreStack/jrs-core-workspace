import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FinancialGatewayFeeRuleService } from './financial_gateway_fee_rule.service';
import { CreateFinancialGatewayFeeRuleDTO } from './dtos/create';
import { FinancialGatewayFeeRuleEntity } from './entities/financial_gateway_fee_rule.entity';
import { ReturnFinancialGatewayFeeRuleDTO } from './dtos/return';

@Controller('financial_gateway_fee_rules')
export class FinancialGatewayFeeRuleController {
  constructor(
    private readonly financialGatewayFeeRuleService: FinancialGatewayFeeRuleService,
  ) {}

  @Post()
  async create(
    @Body()
    createFinancialGatewayFeeRule: CreateFinancialGatewayFeeRuleDTO,
  ): Promise<FinancialGatewayFeeRuleEntity> {
    return this.financialGatewayFeeRuleService.create(
      createFinancialGatewayFeeRule,
    );
  }

  @Get()
  async findAll(): Promise<FinancialGatewayFeeRuleEntity[]> {
    return this.financialGatewayFeeRuleService.findAll();
  }

  @Get('active')
  async findActive(
    @Query('account_id') account_id?: string,
  ): Promise<ReturnFinancialGatewayFeeRuleDTO[]> {
    const rules = await this.financialGatewayFeeRuleService.findActive(
      account_id,
    );
    return rules.map(
      (rule) => new ReturnFinancialGatewayFeeRuleDTO(rule),
    );
  }

  @Get('fee')
  async findFee(
    @Query('account_code') account_code: string,
    @Query('gateway') gateway: string,
    @Query('payment_method') payment_method: string,
    @Query('card_brand') card_brand?: string,
    @Query('installments') installments?: string,
  ): Promise<{ percentage_fee: number; fixed_fee: number }> {
    // Validar parâmetros obrigatórios básicos
    if (!account_code || !gateway || !payment_method) {
      throw new BadRequestException(
        'Parâmetros obrigatórios: account_code, gateway, payment_method',
      );
    }

    // Para métodos que não são PIX, card_brand e installments são obrigatórios
    const isPix = payment_method.toUpperCase() === 'PIX';
    
    if (!isPix) {
      if (!card_brand) {
        throw new BadRequestException(
          'card_brand é obrigatório para métodos de pagamento que não sejam PIX',
        );
      }
      if (!installments) {
        throw new BadRequestException(
          'installments é obrigatório para métodos de pagamento que não sejam PIX',
        );
      }
    }

    // Validar installments se fornecido
    let installmentsNumber: number | null = null;
    if (installments) {
      installmentsNumber = parseInt(installments, 10);
      if (isNaN(installmentsNumber) || installmentsNumber < 1) {
        throw new BadRequestException(
          'installments deve ser um número inteiro maior que zero',
        );
      }
    }

    const result = await this.financialGatewayFeeRuleService.findFeeByCriteria(
      account_code,
      gateway,
      payment_method,
      card_brand || null,
      installmentsNumber,
    );

    if (!result) {
      throw new BadRequestException(
        'Regra de taxa não encontrada para os critérios fornecidos.',
      );
    }

    return result;
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<FinancialGatewayFeeRuleEntity> {
    return this.financialGatewayFeeRuleService.findById(id);
  }

  @Get('account/:account_id')
  async findByAccountId(
    @Param('account_id') account_id: string,
  ): Promise<FinancialGatewayFeeRuleEntity[]> {
    return this.financialGatewayFeeRuleService.findByAccountId(account_id);
  }
}
