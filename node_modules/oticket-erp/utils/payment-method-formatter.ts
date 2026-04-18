/**
 * Formata o método de pagamento para exibição
 * @param paymentMethod - Método de pagamento (ex: "pix", "credit")
 * @param installments - Número de parcelas (opcional)
 * @returns String formatada do método de pagamento
 */
function formatPaymentMethod(
  paymentMethod: string | null | undefined,
  installments?: number | null
): string {
  if (!paymentMethod) {
    return "-";
  }

  const method = paymentMethod.toLowerCase().trim();

  // Pix
  if (method === "pix") {
    return "Pix";
  }

  // Crédito
  if (method === "credit" || method === "creditcard") {
    // Se não tiver installments ou for 1, é à vista
    if (!installments || installments === 1) {
      return "Crédito à vista";
    }
    // Se tiver mais de 1 parcela, é parcelado
    return "Crédito parcelado";
  }

  if (method === "pixps") {
    return "Pix Produção"
  }

  

  // Fallback: retorna o método original com primeira letra maiúscula
  return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).toLowerCase();
}

export default formatPaymentMethod;
