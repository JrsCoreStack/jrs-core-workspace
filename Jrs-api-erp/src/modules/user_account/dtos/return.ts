import { ReturnAccountDTO } from 'src/modules/account/dtos/return';
import { ReturnUserDTO } from 'src/modules/user/dtos/return';
import { UserAccountEntity } from '../entities/user_account.entity';

export class ReturnUserAccountDTO {
  id: string;
  user_id: string;
  user?: ReturnUserDTO | null;
  account_id: string;
  account?: ReturnAccountDTO | null;
  created_at: Date;
  updated_at: Date;

  constructor(userAccountEntity: UserAccountEntity) {
    this.id = userAccountEntity.id;
    this.user_id = userAccountEntity.user_id;
    this.account_id = userAccountEntity.account_id;
    this.created_at = userAccountEntity.created_at;
    this.updated_at = userAccountEntity.updated_at;

    this.user = userAccountEntity.user
      ? new ReturnUserDTO(userAccountEntity.user)
      : null;

    this.account = userAccountEntity.account
      ? new ReturnAccountDTO(userAccountEntity.account)
      : null;
  }
}
