/**
 * DTOs e tipos para Producer Payout (Repasses a Produtores)
 */

/**
 * Informações do evento relacionado à solicitação
 */
export interface ProducerPayoutEvent {
  id: number;
  name: string;
  date: string; // ISO 8601
}

/**
 * Informações do usuário que solicitou o repasse
 */
export interface ProducerPayoutUser {
  id: number;
  first_name: string;
  last_name: string;
}

/**
 * Solicitação de pagamento a produtor
 */
export interface ProducerPayoutRequest {
  id: number;
  payment_key: string; // CPF/CNPJ
  payment_receiver: string; // Nome do recebedor
  value: number;
  event_id: number;
  event: ProducerPayoutEvent;
  approved: boolean;
  payed: boolean;
  payment_date: string; // ISO 8601
  created_at: string; // ISO 8601
  bank: number; // Código do banco
  description: string;
  user: ProducerPayoutUser;
  requested_by: number;
}

/**
 * Parâmetros para listar solicitações de pagamento
 */
export interface ListPayoutRequestsParams {
  account_code?: string;
  event_id?: string;
  status?: string; // padrão: "waiting_payment"
  limit?: number; // padrão: 10
  offset?: number; // padrão: 0
}

/**
 * Body para marcar solicitação como paga
 */
export interface MarkAsPaidBody {
  account_code: string;
}

/**
 * Resposta ao marcar como pago
 */
export interface MarkAsPaidResponse {
  message: string;
}

/**
 * Resposta paginada da API de solicitações
 */
export interface PayoutRequestsResponse {
  status: string;
  data: ProducerPayoutRequest[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

/**
 * Body para criar saque manual
 */
export interface CreateManualPayoutBody {
  account_code: string;
  event_id: string;
  amount: number;
  description?: string;
  payment_receiver?: string;
  payment_key?: string;
}

/**
 * Resposta ao criar saque manual
 */
export interface ManualPayoutResponse {
  id: string;
  account_id: string;
  event_id: string;
  event_name: string;
  amount: number;
  description: string;
  financial_entry_id: string;
  payment_receiver?: string;
  payment_key?: string;
  created_at: string;
  updated_at: string;
}
