import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDTO } from './dtos/create';
import { validate } from 'class-validator';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(createAccountDTO: CreateAccountDTO): Promise<AccountEntity> {
    const dto = Object.assign(new CreateAccountDTO(), createAccountDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const account = this.accountRepository.create(createAccountDTO);
    return this.accountRepository.save(account);
  }

  async findAll(): Promise<AccountEntity[]> {
    return this.accountRepository.find();
  }

  async findById(id: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new BadRequestException(`Conta não encontrada.`);
    }
    return account;
  }

  async findByType(type: number): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({ where: { type } });
    if (!account) {
      throw new BadRequestException(`Conta não encontrada.`);
    }
    return account;
  }

  async findByCode(code: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({ where: { code } });
    if (!account) {
      throw new BadRequestException(`Conta não encontrada com código: ${code}`);
    }
    return account;
  }
}
