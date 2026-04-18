import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank_account.entity';
import { Repository } from 'typeorm';
import { CreateBankAccountDTO } from './dtos/create';
import { validate } from 'class-validator';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,
  ) {}

  async create(
    createBankAccountDTO: CreateBankAccountDTO,
  ): Promise<BankAccountEntity> {
    const dto = Object.assign(new CreateBankAccountDTO(), createBankAccountDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const bank = this.bankAccountRepository.create(createBankAccountDTO);
    return this.bankAccountRepository.save(bank);
  }

  async findAll(account_id?: string): Promise<BankAccountEntity[]> {
    return this.bankAccountRepository.find({
      where: {
        account_id: account_id,
      },
      relations: ['account', 'bank'],
    });
  }
}
