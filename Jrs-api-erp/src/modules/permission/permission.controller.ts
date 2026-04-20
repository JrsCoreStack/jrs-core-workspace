import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { PermissionEntity } from './entities/permission.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { AccountGuard } from 'src/guards/account.guard';
import { PermissionGuard } from 'src/guards/permission.guard';
import { RequirePermission } from 'src/decorators/permission.decorator';
import { Permission } from 'src/utils/enums/permission.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiExcludeController()
@ApiTags('Permissùes')
@ApiBearerAuth()
@Controller('permission')
@UseGuards(AuthGuard, AccountGuard, PermissionGuard)
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  @Get()
  @RequirePermission(Permission.ADMIN_ALL)
  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find({
      order: {
        module: 'ASC',
        name: 'ASC',
      },
    });
  }

  @Get(':id')
  @RequirePermission(Permission.ADMIN_ALL)
  async findById(@Param('id') id: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['role_permissions', 'role_permissions.role'],
    });

    if (!permission) {
      throw new Error(`Permiss„o com ID ${id} n„o encontrada.`);
    }

    return permission;
  }

  @Get('by-role/:roleId')
  @RequirePermission(Permission.ADMIN_ALL)
  async findByRole(@Param('roleId') roleId: string): Promise<PermissionEntity[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.role_permissions', 'rp')
      .where('rp.role_id = :roleId', { roleId })
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.name', 'ASC')
      .getMany();

    return permissions;
  }
}
