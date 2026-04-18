import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RoleEntity } from './entities/role.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { PermissionGuard } from 'src/guards/permission.guard';
import { RequirePermission } from 'src/decorators/permission.decorator';
import { Permission } from 'src/utils/enums/permission.enum';

@ApiTags('Pap�is (Roles)')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AuthGuard, AccountGuard)
  async findAll(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      created_at: Date;
    }>
  > {
    // Rota para listar roles (necessário para cadastro de colaboradores)
    // Retorna apenas id, name e description (sem permissões detalhadas)
    const roles = await this.roleService.findAll(false);
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      created_at: role.created_at,
    }));
  }

  @Get(':id')
  @UseGuards(AuthGuard, AccountGuard, PermissionGuard)
  @RequirePermission(Permission.ADMIN_ALL)
  async findById(@Param('id') id: string): Promise<RoleEntity> {
    return this.roleService.findById(id);
  }
}
