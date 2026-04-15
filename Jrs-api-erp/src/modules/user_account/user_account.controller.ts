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
import { UserAccountService } from './user_account.service';
import { CreateUserAccountDTO } from './dtos/create';
import { UserAccountEntity } from './entities/user_account.entity';
import { CurrentAccountId } from 'src/decorators/account.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('user_account')
export class UserAccountController {
  constructor(private readonly userAccountService: UserAccountService) {}

  @Post()
  async create(
    @Body() createUserAccount: CreateUserAccountDTO,
  ): Promise<UserAccountEntity> {
    return this.userAccountService.create(createUserAccount);
  }

  @UseGuards(AuthGuard, AccountGuard, RoleGuard)
  @Get()
  async findAll(
    @CurrentAccountId() account_id: string,
    @Query('name') name?: string,
  ): Promise<UserAccountEntity[]> {
    return this.userAccountService.findAll(account_id, name);
  }

  @Put(':id')
  async update(
    @Body() updateUser: Partial<CreateUserAccountDTO>,
    @Param('id') id: string,
  ): Promise<UserAccountEntity> {
    return this.userAccountService.update(id, updateUser);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.userAccountService.delete(id);
  }

  @Get('/user/:id')
  async findByUserId(@Param('id') id: string): Promise<UserAccountEntity[]> {
    return this.userAccountService.findByUserId(id);
  }
}
