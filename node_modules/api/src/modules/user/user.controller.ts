import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDTO } from './dtos/create';
import { UserEntity } from './entities/user.entity';

/**
 * Rotas de gestão de colaboradores (listagem/edição) foram desativadas neste projeto.
 * Mantém apenas criação de usuário (ex.: cadastro público).
 */
@ApiTags('Usuários')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail já cadastrado' })
  async create(@Body() createUser: CreateUserDTO): Promise<UserEntity> {
    return this.userService.create(createUser);
  }
}
