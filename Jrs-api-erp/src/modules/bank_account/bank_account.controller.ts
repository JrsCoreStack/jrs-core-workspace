import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { BankAccountService } from './bank_account.service';
import { CreateBankAccountDTO } from './dtos/create';
import { BankAccountEntity } from './entities/bank_account.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';

@ApiExcludeController()
@ApiTags('Contas Bancùrias')
@ApiBearerAuth()
@Controller('bank_account')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  async create(
    @Body() createBankAccount: CreateBankAccountDTO,
  ): Promise<BankAccountEntity> {
    return this.bankAccountService.create(createBankAccount);
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get()
  async findAll(
    @CurrentAccountId() account_id: string,
  ): Promise<BankAccountEntity[]> {
    return this.bankAccountService.findAll(account_id);
  }
}
