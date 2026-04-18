import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinancialChartOfAccountsEntity } from './entities/financial_chart_of_accounts.entity';
import { Repository } from 'typeorm';
import { CreateFinancialChartOfAccountsDTO } from './dtos/create';
import { validate } from 'class-validator';

@Injectable()
export class FinancialChartOfAccountsService {
  constructor(
    @InjectRepository(FinancialChartOfAccountsEntity)
    private readonly chartOfAccountsRepository: Repository<FinancialChartOfAccountsEntity>,
  ) {}

  async create(
    createChartOfAccountsDTO: CreateFinancialChartOfAccountsDTO,
  ): Promise<FinancialChartOfAccountsEntity> {
    const dto = Object.assign(
      new CreateFinancialChartOfAccountsDTO(),
      createChartOfAccountsDTO,
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

    const existingCode = await this.chartOfAccountsRepository.findOne({
      where: { code: createChartOfAccountsDTO.code },
    });
    if (existingCode) {
      throw new BadRequestException(
        `Código ${createChartOfAccountsDTO.code} já existe.`,
      );
    }

    const chartOfAccount = this.chartOfAccountsRepository.create({
      ...createChartOfAccountsDTO,
      active: createChartOfAccountsDTO.active ?? true,
    });
    return this.chartOfAccountsRepository.save(chartOfAccount);
  }

  async findAll(): Promise<FinancialChartOfAccountsEntity[]> {
    return this.chartOfAccountsRepository.find();
  }

  async findById(id: string): Promise<FinancialChartOfAccountsEntity> {
    const chartOfAccount = await this.chartOfAccountsRepository.findOne({
      where: { id },
    });
    if (!chartOfAccount) {
      throw new BadRequestException(`Plano de contas não encontrado.`);
    }
    return chartOfAccount;
  }

  async findByAccountId(account_id: string): Promise<FinancialChartOfAccountsEntity[]> {
    return this.chartOfAccountsRepository.find({
      where: { account_id },
    });
  }

  async findByCode(code: string): Promise<FinancialChartOfAccountsEntity> {
    const chartOfAccount = await this.chartOfAccountsRepository.findOne({
      where: { code },
    });
    if (!chartOfAccount) {
      throw new BadRequestException(`Plano de contas não encontrado.`);
    }
    return chartOfAccount;
  }
}
