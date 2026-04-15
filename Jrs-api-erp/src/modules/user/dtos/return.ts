import { UserEntity } from '../entities/user.entity';

export class ReturnUserDTO {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  totp_secret: string | null;
  is2fa_enabled: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(userEntity: UserEntity) {
    this.id = userEntity.id;
    this.name = userEntity.name;
    this.cpf = userEntity.cpf;
    this.email = userEntity.email;
    this.phone = userEntity.phone;
    this.password = userEntity.password;
    this.totp_secret = userEntity.totp_secret;
    this.is2fa_enabled = userEntity.is2fa_enabled;
    this.created_at = userEntity.created_at;
    this.updated_at = userEntity.updated_at;
  }
}
