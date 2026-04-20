import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiExcludeController,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dtos/create';
import { AccountEntity } from './entities/account.entity';

@ApiExcludeController()
@ApiTags('Contas')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiBody({ type: CreateAccountDTO })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createAccount: CreateAccountDTO): Promise<AccountEntity> {
    return this.accountService.create(createAccount);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as contas' })
  @ApiResponse({ status: 200, description: 'Lista de contas' })
  async findAll(): Promise<AccountEntity[]> {
    return this.accountService.findAll();
  }
}
