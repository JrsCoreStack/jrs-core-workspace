import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { FinancialAccountEntity } from './entities/financial_account.entity';
import { CreateFinancialAccountDTO } from './dtos/create';

@Injectable()
export class FinancialAccountService {
    constructor(
        @InjectRepository(FinancialAccountEntity)
        private readonly financialAccountRepository: Repository<FinancialAccountEntity>,
    ) { }

    async create(
        createFinancialAccountDTO: CreateFinancialAccountDTO,
    ): Promise<FinancialAccountEntity> {
        const dto = Object.assign(
            new CreateFinancialAccountDTO(),
            createFinancialAccountDTO,
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

        const financialAccount = this.financialAccountRepository.create({
            ...createFinancialAccountDTO
        });
        return this.financialAccountRepository.save(financialAccount);
    }

    async findAll(): Promise<FinancialAccountEntity[]> {
        return this.financialAccountRepository.find();
    }

    async findById(id: string): Promise<FinancialAccountEntity> {
        const financialAccount = await this.financialAccountRepository.findOne({
            where: { id },
        });
        if (!financialAccount) {
            throw new BadRequestException(`Conta financeira não encontrada.`);
        }
        return financialAccount;
    }

    async findByAccountId(account_id: string): Promise<FinancialAccountEntity[]> {
        return this.financialAccountRepository.find({
            where: { account_id },
        });
    }

}
