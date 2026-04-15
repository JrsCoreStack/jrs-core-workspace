import { ReturnAccountDTO } from 'src/modules/account/dtos/return';
import { EventEntity } from '../entities/event.entity';

export class ReturnEventDTO {
  id: string;
  name: string;
  id_reference: number;
  account_id: string;
  account?: ReturnAccountDTO | null;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;

  constructor(eventEntity: EventEntity) {
    this.id = eventEntity.id;
    this.name = eventEntity.name;
    this.id_reference = eventEntity.id_reference;
    this.account_id = eventEntity.account_id;
    this.start_date = eventEntity.start_date;
    this.end_date = eventEntity.end_date;
    this.created_at = eventEntity.created_at;
    this.updated_at = eventEntity.updated_at;

    this.account = eventEntity.account
      ? new ReturnAccountDTO(eventEntity.account)
      : null;
  }
}
