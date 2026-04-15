"use client";

import { useAuthService } from "@/hooks/use-auth-service";
import {
  FinancialStats,
  FinancialEntry,
  FinancialEntryListResponse,
  ListTransactionsParams,
  EventFinancialBalance,
  EventFinancialBalanceParams,
  FinancialBalanceSummary,
} from "@/models/financial-entry";
import { useCallback } from "react";

/**
 * Hook para operações de Financial Entry em Client Components
 */
export const useFinancialEntryService = () => {
  const { authenticatedRequest } = useAuthService();

  /**
   * Lista transações financeiras com filtros, paginação e ordenação
   */
  const LIST_TRANSACTIONS = useCallback(
    async (
      params?: ListTransactionsParams
    ): Promise<FinancialEntryListResponse | undefined> => {
      try {
        const queryParams = new URLSearchParams();

        // Paginação
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.offset) {
          queryParams.append("offset", params.offset.toString());
        }

        // Filtros
        if (params?.account_id) {
          queryParams.append("account_id", params.account_id);
        }
        if (params?.chart_of_account_id) {
          queryParams.append("chart_of_account_id", params.chart_of_account_id);
        }
        if (params?.type) {
          queryParams.append("type", params.type);
        }
        if (params?.reference_type) {
          queryParams.append("reference_type", params.reference_type);
        }
        if (params?.reference_id) {
          queryParams.append("reference_id", params.reference_id);
        }
        if (params?.external_source) {
          queryParams.append("external_source", params.external_source);
        }
        if (params?.start_date) {
          queryParams.append("start_date", params.start_date);
        }
        if (params?.end_date) {
          queryParams.append("end_date", params.end_date);
        }
        if (params?.description) {
          queryParams.append("description", params.description);
        }
        if (params?.event_id) {
          queryParams.append("event_id", params.event_id);
        }
        if (params?.event_name) {
          queryParams.append("event_name", params.event_name);
        }
        if (params?.payment_id) {
          queryParams.append("payment_id", params.payment_id);
        }

        // Ordenação
        if (params?.order_by) {
          queryParams.append("order_by", params.order_by);
        }
        if (params?.order_direction) {
          queryParams.append("order_direction", params.order_direction);
        }

        // Agrupamento
        if (params?.group_by_reference !== undefined) {
          queryParams.append("group_by_reference", params.group_by_reference.toString());
        }

        const queryString = queryParams.toString();
        const url = `/financial_entry/transactions${
          queryString ? `?${queryString}` : ""
        }`;

        return await authenticatedRequest<FinancialEntryListResponse>("get", url);
      } catch (error) {
        console.error("List transactions error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca uma entrada financeira por ID
   */
  const GET_BY_ID = useCallback(
    async (id: string): Promise<FinancialEntry | undefined> => {
      try {
        return await authenticatedRequest<FinancialEntry>(
          "get",
          `/financial_entry/${id}`
        );
      } catch (error) {
        console.error("Get financial entry by ID error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca entradas financeiras de uma conta específica
   */
  const GET_BY_ACCOUNT = useCallback(
    async (accountId: string): Promise<FinancialEntry[] | undefined> => {
      try {
        return await authenticatedRequest<FinancialEntry[]>(
          "get",
          `/financial_entry/account/${accountId}`
        );
      } catch (error) {
        console.error("Get financial entries by account error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca estatísticas financeiras de uma conta
   */
  const GET_STATS = useCallback(
    async (
      accountId: string,
      startDate?: Date,
      endDate?: Date
    ): Promise<FinancialStats | undefined> => {
      try {
        let url = `/financial_entry/stats/${accountId}`;
        const params = new URLSearchParams();

        if (startDate) {
          params.append("start_date", startDate.toISOString());
        }
        if (endDate) {
          params.append("end_date", endDate.toISOString());
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        return await authenticatedRequest<FinancialStats>("get", url);
      } catch (error) {
        console.error("Get financial stats error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca saldo financeiro por evento
   */
  const GET_EVENTS_FINANCIAL_BALANCE = useCallback(
    async (
      params?: EventFinancialBalanceParams
    ): Promise<EventFinancialBalance[] | undefined> => {
      try {
        const queryParams = new URLSearchParams();

        if (params?.account_id) {
          queryParams.append("account_id", params.account_id);
        }
        if (params?.start_date) {
          queryParams.append("start_date", params.start_date);
        }
        if (params?.end_date) {
          queryParams.append("end_date", params.end_date);
        }
        if (params?.event_id) {
          queryParams.append("event_id", params.event_id);
        }
        if (params?.event_name) {
          queryParams.append("event_name", params.event_name);
        }

        const queryString = queryParams.toString();
        const url = `/financial_entry/events/financial-balance${
          queryString ? `?${queryString}` : ""
        }`;

        return await authenticatedRequest<EventFinancialBalance[]>("get", url);
      } catch (error) {
        console.error("Get events financial balance error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  /**
   * Busca resumo consolidado de saldos financeiros por evento
   */
  const GET_EVENTS_FINANCIAL_BALANCE_SUMMARY = useCallback(
    async (
      params?: EventFinancialBalanceParams
    ): Promise<FinancialBalanceSummary | undefined> => {
      try {
        const queryParams = new URLSearchParams();

        if (params?.account_id) {
          queryParams.append("account_id", params.account_id);
        }
        if (params?.start_date) {
          queryParams.append("start_date", params.start_date);
        }
        if (params?.end_date) {
          queryParams.append("end_date", params.end_date);
        }
        if (params?.event_id) {
          queryParams.append("event_id", params.event_id);
        }
        if (params?.event_name) {
          queryParams.append("event_name", params.event_name);
        }

        const queryString = queryParams.toString();
        const url = `/financial_entry/events/financial-balance/summary${
          queryString ? `?${queryString}` : ""
        }`;

        return await authenticatedRequest<FinancialBalanceSummary>("get", url);
      } catch (error) {
        console.error("Get events financial balance summary error:", error);
        throw error;
      }
    },
    [authenticatedRequest]
  );

  return {
    LIST_TRANSACTIONS,
    GET_BY_ID,
    GET_BY_ACCOUNT,
    GET_STATS,
    GET_EVENTS_FINANCIAL_BALANCE,
    GET_EVENTS_FINANCIAL_BALANCE_SUMMARY,
  };
};
