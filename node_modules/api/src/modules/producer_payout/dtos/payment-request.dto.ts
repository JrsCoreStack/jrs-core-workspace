export class PaymentRequestDTO {
  id: number;
  payment_key: string;
  payment_receiver: string;
  value: number;
  event_id: number;
  event: {
    id: number;
    name: string;
    date: string;
  };
  approved: boolean;
  payed: boolean;
  payment_date: string;
  created_at: string;
  bank: number;
  description: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  requested_by: number;
}

export class MarkAsPaidDTO {
  account_code: string;
}
