import { ReturnEventDTO } from 'src/modules/event/dtos/return';
import { TransactionEntity } from '../entities/transaction.entity';
import { ReturnBankDTO } from 'src/modules/bank/dtos/return';
import { ReturnStatementOrganizationDTO } from 'src/modules/statement_organization/dtos/return';
import { ReturnStatementProducerDTO } from 'src/modules/statement_producer/dtos/return';

export class ReturnTransactionDTO {
  id: string;
  event_id: string;
  bank_id: string;
  sale_id: number;
  payment_method: string;
  payment_installments: number;
  payment_id: string;
  payment_status: number;
  total: number;
  event?: ReturnEventDTO | null;
  bank?: ReturnBankDTO | null;
  statements_organization?: ReturnStatementOrganizationDTO[] | null;
  statements_producer?: ReturnStatementProducerDTO[] | null;
  created_at: Date;
  updated_at: Date;

  constructor(transactionEntity: TransactionEntity) {
    this.id = transactionEntity.id;
    this.event_id = transactionEntity.event_id;
    this.bank_id = transactionEntity.bank_id;
    this.sale_id = transactionEntity.sale_id;
    this.payment_method = transactionEntity.payment_method;
    this.payment_installments = transactionEntity.payment_installments;
    this.payment_id = transactionEntity.payment_id;
    this.payment_status = transactionEntity.payment_status;
    this.total = transactionEntity.total;
    this.created_at = transactionEntity.created_at;
    this.updated_at = transactionEntity.updated_at;

    this.event = transactionEntity.event
      ? new ReturnEventDTO(transactionEntity.event)
      : null;

    this.statements_organization = transactionEntity.statements_organization
      ? transactionEntity.statements_organization.map(
          (statement) => new ReturnStatementOrganizationDTO(statement),
        )
      : null;

    this.statements_producer = transactionEntity.statements_producer
      ? transactionEntity.statements_producer.map(
          (statement) => new ReturnStatementProducerDTO(statement),
        )
      : null;
  }
}
