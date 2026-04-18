import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_user_account')
export class UserAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  user_id: string;

  @Column({
    name: 'account_id',
    type: 'uuid',
    nullable: false,
  })
  account_id: string;

  @Column({
    name: 'role_id',
    type: 'uuid',
    nullable: true,
  })
  role_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.user_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @ManyToOne(() => AccountEntity, (account) => account.user_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: AccountEntity;

  @ManyToOne(() => RoleEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleEntity;
}
