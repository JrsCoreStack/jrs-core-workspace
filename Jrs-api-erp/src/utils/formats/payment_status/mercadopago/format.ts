export function formatPaymentStatusMercadoPago(status: string): number {
  const statusMap: { [key: string]: number } = {
    approved: 1,
    accredited: 1,
    rejected_high_risk: 2,
    rejected_insufficient_data: 2,
    rejected_by_bank: 2,
    rejected_by_regulations: 2,
    cc_rejected_other_reason: 2,
    cc_rejected_max_attempts: 2,
    cc_rejected_invalid_installments: 2,
    cc_rejected_insufficient_amount: 2,
    cc_rejected_high_risk: 2,
    cc_rejected_duplicated_payment: 2,
    cc_rejected_card_disabled: 2,
    cc_rejected_call_for_authorize: 2,
    cc_rejected_blacklist: 2,
    pending: 3,
    pending_waiting_transfer: 3,
    pending_provider_response: 3,
    pending_review_manual: 3,
    refunded: 4,
    partially_refunded: 4,
    in_mediation: 5,
    expired: 6,
    cancelled: 7,
  };

  return statusMap[status] ?? 0;
}

// Aprovado - 1
// Recusado - 2
// Pendente - 3
// Reembolsado - 4
// Em Disputa - 5
// Expirado - 6
// Cancelado - 7
