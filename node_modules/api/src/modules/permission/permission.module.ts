import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { RoleModule } from '../role/role.module';
import { RoleEntity } from '../role/entities/role.entity';
import { UserAccountEntity } from '../user_account/entities/user_account.entity';
import { RolePermissionEntity } from '../role_permission/entities/role_permission.entity';
import { PermissionGuard } from 'src/guards/permission.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RoleEntity,
      UserAccountEntity,
      RolePermissionEntity,
    ]),
    forwardRef(() => RoleModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionService, PermissionGuard],
})
export class PermissionModule {}
