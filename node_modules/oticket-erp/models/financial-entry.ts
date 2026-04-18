/**
 * DTOs e tipos para Financial Entry
 */

/**
 * Enum para tipos de entrada financeira
 */
export enum FinancialEntryType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

/**
 * Interface para Chart of Accounts (relacionamento)
 */
export interface FinancialChartOfAccounts {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  account_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para Account (relacionamento)
 */
export interface FinancialEntryAccount {
  id: string;
  name: string;
  code: string;
  // ... outros campos da conta
}

/**
 * Interface completa da entidade Financial Entry
 */
export interface FinancialEntry {
  id: string;
  account_id: string;
  chart_of_account_id: string;
  type: FinancialEntryType;
  amount: number;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  external_source: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  event_id?: string | null;
  event_name?: string | null;
  payment_method?: string | null;
  installments?: number | null;
  card_brand?: string | null;
  payment_id?: string | null;
  account?: FinancialEntryAccount;
  chart_of_account?: FinancialChartOfAccounts;
}

/**
 * Parâmetros de filtro para listagem de transações
 */
export interface FinancialEntryFilters {
  account_id?: string;
  chart_of_account_id?: string;
  type?: FinancialEntryType;
  reference_type?: string;
  reference_id?: string;
  external_source?: string;
  start_date?: string; // ISO 8601 ou YYYY-MM-DD
  end_date?: string; // ISO 8601 ou YYYY-MM-DD
  description?: string;
  event_id?: string;
  event_name?: string;
  payment_id?: string; // Código da transação (ex: pay_123456789)
}

/**
 * Parâmetros de paginação
 */
export interface FinancialEntryPagination {
  page?: number; // mínimo: 1
  limit?: number; // mínimo: 1, máximo: 100
  offset?: number; // alternativa ao page
}

/**
 * Parâmetros de ordenação
 */
export interface FinancialEntrySorting {
  order_by?: "entry_date" | "created_at" | "amount";
  order_direction?: "ASC" | "DESC";
}

/**
 * Grupo de transações agrupadas por referência
 */
export interface FinancialEntryGroup {
  reference_id: string | null;
  total: number;
  transaction_count: number;
  date: string;
  transactions: FinancialEntry[];
}

/**
 * Parâmetros completos para listagem de transações
 */
export interface ListTransactionsParams
  extends FinancialEntryFilters,
    FinancialEntryPagination,
    FinancialEntrySorting {
  group_by_reference?: boolean;
}

/**
 * Consolidado financeiro retornado pela API
 */
export interface FinancialConsolidated {
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  profit: number;
}

/**
 * Resposta paginada da API (pode retornar transações ou grupos)
 */
export interface FinancialEntryListResponse {
  data: FinancialEntry[] | FinancialEntryGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  consolidated: FinancialConsolidated;
}

/**
 * Estatísticas financeiras retornadas pela API
 */
export interface FinancialStats {
  revenue: number;
  cost: number;
  profit: number;
}

/**
 * Saldo financeiro por evento
 */
export interface EventFinancialBalance {
  event_id: string | null;
  event_name: string | null;
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number; // Total já repassado (solicitações + saques manuais)
  pending_balance: number; // Saldo pendente a repassar (total_liabilities - total_repaid)
  balance: number;
  transaction_count: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
}

/**
 * Parâmetros para buscar saldo financeiro por evento
 */
export interface EventFinancialBalanceParams {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  event_id?: string; // Busca exata por ID do evento
  event_name?: string; // Busca parcial por nome do evento (case-insensitive)
}

/**
 * Resposta consolidada de totais financeiros (summary)
 */
export interface FinancialBalanceSummary {
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number;
  total_pending_balance: number; // ⚠️ USE ESTE para "Total a Repassar"
  total_balance: number;
  event_count: number;
  total_transaction_count: number;
}
