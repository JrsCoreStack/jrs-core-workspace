import { Body, Controller, Get, Post } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDTO } from './dtos/create';
import { BankEntity } from './entities/bank.entity';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  async create(@Body() createBank: CreateBankDTO): Promise<BankEntity> {
    return this.bankService.create(createBank);
  }

  @Get()
  async findAll(): Promise<BankEntity[]> {
    return this.bankService.findAll();
  }

}
