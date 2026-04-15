import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';

@Entity('erp_role_permissions')
export class RolePermissionEntity {
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  role_id: string;

  @PrimaryColumn({ name: 'permission_id', type: 'uuid' })
  permission_id: string;

  @ManyToOne(() => RoleEntity, (role) => role.role_permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleEntity;

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.role_permissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permission_id', referencedColumnName: 'id' })
  permission: PermissionEntity;
}
