import { ReturnAccountDTO } from 'src/modules/account/dtos/return';
import { BankAccountEntity } from '../entities/bank_account.entity';

export class ReturnBankAccountDTO {
  id: string;
  account_id: string;
  account?: ReturnAccountDTO | null;
  bank_id: string;
  bank?: ReturnBankAccountDTO | null;
  created_at: Date;
  updated_at: Date;

  constructor(bankAccountEntity: BankAccountEntity) {
    this.id = bankAccountEntity.id;
    this.account_id = bankAccountEntity.account_id;
    this.bank_id = bankAccountEntity.bank_id;
    this.created_at = bankAccountEntity.created_at;
    this.updated_at = bankAccountEntity.updated_at;

    this.account = bankAccountEntity.account
      ? new ReturnAccountDTO(bankAccountEntity.account)
      : null;
  }
}
