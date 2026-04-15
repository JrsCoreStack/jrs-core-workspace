import { UserAccountEntity } from 'src/modules/user_account/entities/user_account.entity';
import { UserStatus } from 'src/utils/enums/user_status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('erp_user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'cpf',
    type: 'varchar',
    length: 11,
    nullable: false,
    unique: true,
  })
  cpf: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 15,
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'totp_secret',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  totp_secret: string | null;

  @Column({
    name: 'is2fa_enabled',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  is2fa_enabled: boolean;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  last_login: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status_enum',
    nullable: false,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => UserAccountEntity, (user_account) => user_account.user)
  user_accounts: UserAccountEntity[];
}
