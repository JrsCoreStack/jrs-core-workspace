/**
 * Formata um telefone para exibição ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 * @param phone - Telefone sem formatação ou já formatado
 * @returns Telefone formatado ((XX) XXXXX-XXXX para celular ou (XX) XXXX-XXXX para fixo) ou "-" se inválido
 */
function formatPhone(phone: string | null | undefined): string {
  if (!phone) {
    return "-";
  }

  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");

  // Verifica se tem 10 ou 11 dígitos (fixo ou celular)
  if (numbers.length === 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  } else if (numbers.length === 11) {
    // Telefone celular: (XX) XXXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  } else {
    // Se não tiver 10 ou 11 dígitos, retorna o valor original ou "-"
    return phone || "-";
  }
}

export default formatPhone;
