import { AccountEntity } from '../entities/account.entity';

export class ReturnAccountDTO {
  id: string;
  name: string;
  code: string;
  email: string;
  type: number;
  level: string;
  created_at: string;
  updated_at: string;

  constructor(accountEntity: AccountEntity) {
    this.id = accountEntity.id;
    this.name = accountEntity.name;
    this.code = accountEntity.code;
    this.email = accountEntity.email;
    this.type = accountEntity.type;
    this.level = accountEntity.level;
    this.created_at = String(accountEntity.created_at);
    this.updated_at = String(accountEntity.updated_at);
  }
}
