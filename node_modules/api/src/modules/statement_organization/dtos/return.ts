import { ReturnTransactionDTO } from 'src/modules/transaction/dtos/return';
import { ReturnAccountDTO } from 'src/modules/account/dtos/return';
import { ReturnEventDTO } from 'src/modules/event/dtos/return';
import { ReturnStatementTypeDTO } from 'src/modules/statement_type/dtos/return';
import { StatementOrganizationEntity } from '../entities/statement_organization.entity';

export class ReturnStatementOrganizationDTO {
  id: string;
  transaction_id: string;
  account_id: string;
  account?: ReturnAccountDTO | null;
  event_id: string;
  event?: ReturnEventDTO | null;
  statement_type_id: string;
  statement_type?: ReturnStatementTypeDTO | null;
  transaction?: ReturnTransactionDTO | null;
  type: string;
  amount: number;
  created_at: Date;
  updated_at: Date;

  constructor(statementEntity: StatementOrganizationEntity) {
    this.id = statementEntity.id;
    this.transaction_id = statementEntity.transaction_id;
    this.account_id = statementEntity.account_id;
    this.event_id = statementEntity.event_id;
    this.amount = statementEntity.amount;
    this.type = statementEntity.type;
    this.created_at = statementEntity.created_at;
    this.updated_at = statementEntity.updated_at;

    this.transaction = statementEntity.transaction
      ? new ReturnTransactionDTO(statementEntity.transaction)
      : null;

    this.event = statementEntity.event
      ? new ReturnEventDTO(statementEntity.event)
      : null;
  }
}
