import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { FinancialGatewayFeeRuleEntity } from './entities/financial_gateway_fee_rule.entity';
import { CreateFinancialGatewayFeeRuleDTO } from './dtos/create';
import { FinancialCardBrand } from 'src/utils/enums/financial_card_brand.enum';
import { AccountService } from '../account/account.service';

@Injectable()
export class FinancialGatewayFeeRuleService {
  constructor(
    @InjectRepository(FinancialGatewayFeeRuleEntity)
    private readonly financialGatewayFeeRuleRepository: Repository<FinancialGatewayFeeRuleEntity>,
    private readonly accountService: AccountService,
  ) {}

  async create(
    createFinancialGatewayFeeRuleDTO: CreateFinancialGatewayFeeRuleDTO,
  ): Promise<FinancialGatewayFeeRuleEntity> {
    const dto = Object.assign(
      new CreateFinancialGatewayFeeRuleDTO(),
      createFinancialGatewayFeeRuleDTO,
    );
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }

    const financialGatewayFeeRule =
      this.financialGatewayFeeRuleRepository.create({
        ...createFinancialGatewayFeeRuleDTO,
      });
    return this.financialGatewayFeeRuleRepository.save(
      financialGatewayFeeRule,
    );
  }

  async findAll(): Promise<FinancialGatewayFeeRuleEntity[]> {
    return this.financialGatewayFeeRuleRepository.find();
  }

  async findById(id: string): Promise<FinancialGatewayFeeRuleEntity> {
    const financialGatewayFeeRule =
      await this.financialGatewayFeeRuleRepository.findOne({
        where: { id },
      });
    if (!financialGatewayFeeRule) {
      throw new BadRequestException(
        `Regra de taxa de gateway não encontrada.`,
      );
    }
    return financialGatewayFeeRule;
  }

  async findByAccountId(
    account_id: string,
  ): Promise<FinancialGatewayFeeRuleEntity[]> {
    return this.financialGatewayFeeRuleRepository.find({
      where: { account_id },
    });
  }

  async findActive(
    account_id?: string,
  ): Promise<FinancialGatewayFeeRuleEntity[]> {
    const where: any = { active: true };
    if (account_id) {
      where.account_id = account_id;
    }
    return this.financialGatewayFeeRuleRepository.find({
      where,
      order: {
        gateway: 'ASC',
        payment_method: 'ASC',
      },
    });
  }

  async findFeeByCriteria(
    account_code: string,
    gateway: string,
    payment_method: string,
    card_brand: string | null,
    installments: number | null,
  ): Promise<{ percentage_fee: number; fixed_fee: number } | null> {
    // Buscar account pelo code para obter o account_id
    const account = await this.accountService.findByCode(account_code);
    const account_id = account.id;
    // Validar card_brand apenas se fornecido
    if (card_brand) {
      const validCardBrand = Object.values(FinancialCardBrand).includes(
        card_brand as FinancialCardBrand,
      );
      if (!validCardBrand) {
        throw new BadRequestException(
          `card_brand inválido. Valores aceitos: ${Object.values(FinancialCardBrand).join(', ')}`,
        );
      }
    }

    // Construir condições de busca
    const where: any = {
      account_id,
      gateway,
      payment_method,
      active: true,
    };

    // Se card_brand foi fornecido, buscar por ele; caso contrário, buscar onde é NULL
    if (card_brand) {
      where.card_brand = card_brand as FinancialCardBrand;
    } else {
      where.card_brand = null;
    }

    // Se installments foi fornecido, buscar por ele; caso contrário, buscar onde é NULL
    if (installments !== null && installments !== undefined) {
      where.installments = installments;
    } else {
      where.installments = null;
    }

    // Buscar regra exata que corresponde a todos os critérios
    const rule = await this.financialGatewayFeeRuleRepository.findOne({
      where,
    });

    if (!rule) {
      return null;
    }

    return {
      percentage_fee: Number(rule.percentage_fee),
      fixed_fee: Number(rule.fixed_fee),
    };
  }
}
