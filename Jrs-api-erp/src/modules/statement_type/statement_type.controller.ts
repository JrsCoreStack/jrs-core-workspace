import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { StatementTypeService } from './statement_type.service';
import { StatementTypeEntity } from './entities/statement_type.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { CurrentAccountId } from 'src/decorators/account.decorator';
import { CreateStatementTypeDTO } from './dtos/create';

@ApiExcludeController()
@ApiTags('Tipos de Extrato')
@ApiBearerAuth()
@Controller('statement_type')
export class StatementTypeController {
  constructor(private readonly statementTypeService: StatementTypeService) {}

  @UseGuards(AuthGuard, AccountGuard)
  @Post()
  async create(
    @Body() createStatementType: CreateStatementTypeDTO,
  ): Promise<StatementTypeEntity> {
    return this.statementTypeService.create(createStatementType);
  }

  @UseGuards(AuthGuard, AccountGuard)
  @Get()
  async findAll(): Promise<{
    data: StatementTypeEntity[];
    total: number;
  }> {
    return this.statementTypeService.findAll();
  }
}
