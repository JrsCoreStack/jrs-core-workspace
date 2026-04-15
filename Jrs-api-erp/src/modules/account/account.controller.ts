import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dtos/create';
import { AccountEntity } from './entities/account.entity';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(
    @Body() createAccount: CreateAccountDTO,
  ): Promise<AccountEntity> {
    return this.accountService.create(createAccount);
  }

  @Get()
  async findAll(): Promise<AccountEntity[]> {
    return this.accountService.findAll();
  }
}
