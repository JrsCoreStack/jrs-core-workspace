import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'uuid-do-usuario', description: 'ID único do usuário' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'João Silva' })
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ example: '12345678900', description: 'CPF (apenas dígitos)' })
  @Column({ name: 'cpf', type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @ApiProperty({ example: 'joao@email.com' })
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @ApiProperty({ example: '11999999999' })
  @Column({ name: 'phone', type: 'varchar', length: 15, nullable: false })
  phone: string;

  @ApiProperty({ example: '$2b$10$...', description: 'Hash bcrypt da senha' })
  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @Column({ name: 'totp_secret', type: 'varchar', length: 255, nullable: true, default: null })
  totp_secret: string | null;

  @ApiProperty({ example: false })
  @Column({ name: 'is2fa_enabled', type: 'boolean', default: false, nullable: false })
  is2fa_enabled: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true, default: null })
  last_login: Date | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @Column({ name: 'status', type: 'enum', enum: UserStatus, enumName: 'user_status_enum', nullable: false, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => UserAccountEntity, (user_account) => user_account.user)
  user_accounts: UserAccountEntity[];
}
