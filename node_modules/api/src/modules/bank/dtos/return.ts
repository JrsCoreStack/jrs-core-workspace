import { ReturnAccountDTO } from 'src/modules/account/dtos/return';
import { BankEntity } from '../entities/bank.entity';

export class ReturnBankDTO {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;

  constructor(bankEntity: BankEntity) {
    this.id = bankEntity.id;
    this.name = bankEntity.name;
    this.created_at = bankEntity.created_at;
    this.updated_at = bankEntity.updated_at;
  }
}
