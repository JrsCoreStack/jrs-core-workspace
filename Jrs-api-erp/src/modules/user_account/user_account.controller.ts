import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserAccountService } from './user_account.service';
import { CreateUserAccountDTO } from './dtos/create';
import { UserAccountEntity } from './entities/user_account.entity';
import { CurrentAccountId } from 'src/decorators/account.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@ApiTags('Usuário-Conta')
@ApiBearerAuth()
@Controller('user_account')
export class UserAccountController {
  constructor(private readonly userAccountService: UserAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Vincular usuário a uma conta' })
  @ApiBody({ type: CreateUserAccountDTO })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso' })
  async create(@Body() createUserAccount: CreateUserAccountDTO): Promise<UserAccountEntity> {
    return this.userAccountService.create(createUserAccount);
  }

  @UseGuards(AuthGuard, AccountGuard, RoleGuard)
  @Get()
  @ApiOperation({ summary: 'Listar usuários da conta logada' })
  @ApiQuery({ name: 'name', required: false, description: 'Filtrar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de vínculos usuário-conta' })
  async findAll(
    @CurrentAccountId() account_id: string,
    @Query('name') name?: string,
  ): Promise<UserAccountEntity[]> {
    return this.userAccountService.findAll(account_id, name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar vínculo usuário-conta' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado' })
  async update(
    @Body() updateUser: Partial<CreateUserAccountDTO>,
    @Param('id') id: string,
  ): Promise<UserAccountEntity> {
    return this.userAccountService.update(id, updateUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover vínculo usuário-conta' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Vínculo removido' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.userAccountService.delete(id);
  }

  @Get('/user/:id')
  @ApiOperation({ summary: 'Buscar vínculos por ID do usuário' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Vínculos do usuário' })
  async findByUserId(@Param('id') id: string): Promise<UserAccountEntity[]> {
    return this.userAccountService.findByUserId(id);
  }
}
