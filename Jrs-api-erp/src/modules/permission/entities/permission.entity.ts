import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermissionEntity } from 'src/modules/role_permission/entities/role_permission.entity';
import { Permission } from 'src/utils/enums/permission.enum';

@Entity('erp_permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  name: Permission;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'module',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  module: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.permission,
    { cascade: true },
  )
  role_permissions: RolePermissionEntity[];
}
