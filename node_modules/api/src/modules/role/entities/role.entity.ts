import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermissionEntity } from 'src/modules/role_permission/entities/role_permission.entity';
import { UserRole } from 'src/utils/enums/user_role.enum';

@Entity('erp_roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    nullable: false,
    unique: true,
  })
  name: UserRole;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.role,
    { cascade: true },
  )
  role_permissions: RolePermissionEntity[];
}
