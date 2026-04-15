import { StatementTypeEntity } from '../entities/statement_type.entity';

export class ReturnStatementTypeDTO {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;

  constructor(statementTypeEntity: StatementTypeEntity) {
    this.id = statementTypeEntity.id;
    this.name = statementTypeEntity.name;
    this.description = statementTypeEntity.description;
    this.created_at = statementTypeEntity.created_at;
    this.updated_at = statementTypeEntity.updated_at;
  }
}
