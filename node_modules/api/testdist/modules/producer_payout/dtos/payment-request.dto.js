"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAsPaidDTO = exports.PaymentRequestDTO = void 0;
class PaymentRequestDTO {
    id;
    payment_key;
    payment_receiver;
    value;
    event_id;
    event;
    approved;
    payed;
    payment_date;
    created_at;
    bank;
    description;
    user;
    requested_by;
}
exports.PaymentRequestDTO = PaymentRequestDTO;
class MarkAsPaidDTO {
    account_code;
}
exports.MarkAsPaidDTO = MarkAsPaidDTO;
