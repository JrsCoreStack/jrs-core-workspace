export function formatPaymentStatusPicpay(status: string): number {
  const statusMap: { [key: string]: number } = {
    PAID: 1,
    DENIED: 2,
    PENDING: 3,
    REFUNDED: 4,
    PARTIALLY_REFUNDED: 4,
    EXPIRED: 6,
    CANCELED: 7,
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
