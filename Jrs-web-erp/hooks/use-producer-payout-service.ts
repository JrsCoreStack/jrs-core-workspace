"use client"

import { useCallback } from "react"
import { useAuthService } from "./use-auth-service"
import {
  ProducerPayoutRequest,
  ListPayoutRequestsParams,
  MarkAsPaidBody,
  MarkAsPaidResponse,
  PayoutRequestsResponse,
  CreateManualPayoutBody,
  ManualPayoutResponse,
} from "@/models/producer-payout"

export function useProducerPayoutService() {
  const { authenticatedRequest } = useAuthService()

  /**
   * Lista solicitações de pagamento a produtores
   */
  const LIST_REQUESTS = useCallback(
    async (
      params?: ListPayoutRequestsParams
    ): Promise<ProducerPayoutRequest[] | undefined> => {
      try {
        const queryParams = new URLSearchParams()

        if (params?.account_code) {
          queryParams.append("account_code", params.account_code)
        }
        if (params?.event_id) {
          queryParams.append("event_id", params.event_id)
        }
        if (params?.status) {
          queryParams.append("status", params.status)
        }
        if (params?.limit !== undefined) {
          queryParams.append("limit", params.limit.toString())
        }
        if (params?.offset !== undefined) {
          queryParams.append("offset", params.offset.toString())
        }

        const queryString = queryParams.toString()
        const url = `/producer_payout/requests${
          queryString ? `?${queryString}` : ""
        }`

        const response = await authenticatedRequest<PayoutRequestsResponse>("get", url)
        
        // Extrair o array de dados da resposta
        if (response && response.data) {
          return response.data
        }
        
        return []
      } catch (error) {
        console.error("List payout requests error:", error)
        throw error
      }
    },
    [authenticatedRequest]
  )

  /**
   * Marca uma solicitação como paga
   */
  const MARK_AS_PAID = useCallback(
    async (
      requestId: number,
      body: MarkAsPaidBody
    ): Promise<MarkAsPaidResponse | undefined> => {
      try {
        const url = `/producer_payout/requests/${requestId}/mark-as-paid`

        return await authenticatedRequest<MarkAsPaidResponse>("put", url, body)
      } catch (error) {
        console.error("Mark as paid error:", error)
        throw error
      }
    },
    [authenticatedRequest]
  )

  /**
   * Cria um saque manual
   */
  const CREATE_MANUAL_PAYOUT = useCallback(
    async (
      body: CreateManualPayoutBody
    ): Promise<ManualPayoutResponse | undefined> => {
      try {
        const url = `/producer_payout/manual`

        return await authenticatedRequest<ManualPayoutResponse>("post", url, body)
      } catch (error) {
        console.error("Create manual payout error:", error)
        throw error
      }
    },
    [authenticatedRequest]
  )

  return {
    LIST_REQUESTS,
    MARK_AS_PAID,
    CREATE_MANUAL_PAYOUT,
  }
}
