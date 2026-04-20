"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatementOrganizationDTO = void 0;
const return_1 = require("src/modules/transaction/dtos/return");
const return_2 = require("src/modules/event/dtos/return");
class ReturnStatementOrganizationDTO {
    id;
    transaction_id;
    account_id;
    account;
    event_id;
    event;
    statement_type_id;
    statement_type;
    transaction;
    type;
    amount;
    created_at;
    updated_at;
    constructor(statementEntity) {
        this.id = statementEntity.id;
        this.transaction_id = statementEntity.transaction_id;
        this.account_id = statementEntity.account_id;
        this.event_id = statementEntity.event_id;
        this.amount = statementEntity.amount;
        this.type = statementEntity.type;
        this.created_at = statementEntity.created_at;
        this.updated_at = statementEntity.updated_at;
        this.transaction = statementEntity.transaction
            ? new return_1.ReturnTransactionDTO(statementEntity.transaction)
            : null;
        this.event = statementEntity.event
            ? new return_2.ReturnEventDTO(statementEntity.event)
            : null;
    }
}
exports.ReturnStatementOrganizationDTO = ReturnStatementOrganizationDTO;
