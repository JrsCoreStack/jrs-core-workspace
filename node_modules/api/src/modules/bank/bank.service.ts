import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankEntity } from './entities/bank.entity';
import { Repository } from 'typeorm';
import { CreateBankDTO } from './dtos/create';
import { validate } from 'class-validator';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
  ) {}

  async create(createBankDTO: CreateBankDTO): Promise<BankEntity> {
    const dto = Object.assign(new CreateBankDTO(), createBankDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const bank = this.bankRepository.create(createBankDTO);
    return this.bankRepository.save(bank);
  }

  async findAll(): Promise<BankEntity[]> {
    return this.bankRepository.find();
  }
}
