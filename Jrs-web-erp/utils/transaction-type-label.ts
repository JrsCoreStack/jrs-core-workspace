import { FinancialEntry } from "@/models/financial-entry";

function getTransactionTypeLabel(transaction: FinancialEntry): string {
    const accountType = transaction.chart_of_account?.type;
    const entryType = transaction.type;
  
    // Entrada de dinheiro (ATIVO com DÉBITO)
    if (accountType === 'ASSET' && entryType === 'DEBIT') {
      return 'Entrada';
    }
  
    // Saída de dinheiro (ATIVO com CRÉDITO)
    if (accountType === 'ASSET' && entryType === 'CREDIT') {
      return 'Saída';
    }
  
    // Receita (INCOME com CRÉDITO)
    if (accountType === 'INCOME' && entryType === 'CREDIT') {
      return 'Receita';
    }
  
    // Despesa (EXPENSE com DÉBITO)
    if (accountType === 'EXPENSE' && entryType === 'DEBIT') {
      return 'Despesa';
    }
  
    // Obrigação (LIABILITY com CRÉDITO)
    if (accountType === 'LIABILITY' && entryType === 'CREDIT') {
      return 'Obrigação';
    }
  
    // Pagamento de obrigação (LIABILITY com DÉBITO)
    if (accountType === 'LIABILITY' && entryType === 'DEBIT') {
      return 'Pagamento';
    }
  
    // Fallback para os termos técnicos
    return entryType === 'CREDIT' ? 'Crédito' : 'Débito';
  }

export default getTransactionTypeLabel;