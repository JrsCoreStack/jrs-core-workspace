/**
 * Formata um CPF para exibição (XXX.XXX.XXX-XX)
 * @param cpf - CPF sem formatação ou já formatado
 * @returns CPF formatado (XXX.XXX.XXX-XX) ou "-" se inválido
 */
function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) {
    return "-";
  }

  // Remove todos os caracteres não numéricos
  const numbers = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) {
    // Se não tiver 11 dígitos, retorna o valor original ou "-"
    return cpf || "-";
  }

  // Formata: XXX.XXX.XXX-XX
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export default formatCPF;
