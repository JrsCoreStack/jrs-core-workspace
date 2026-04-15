import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dtos/create';
import { UserEntity } from './entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(AuthGuard)
  // @Roles(UserAccountRole.ADMIN)
  @Post()
  async create(@Body() createUser: CreateUserDTO): Promise<UserEntity> {
    return this.userService.create(createUser);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
  ): Promise<UserEntity[]> {
    return this.userService.findAll(search);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.findById(id);
  }

  @Put(':id')
  async update(
    @Body() updateUser: Partial<CreateUserDTO>,
    @Param('id') id: string,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateUser);
  }
}
