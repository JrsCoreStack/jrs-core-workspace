/**
 * Interface para configuração de um produto
 * Cada produto tem seu próprio banco de dados e configurações
 */
export interface ProductConfig {
  /** Identificador único do produto (ex: 'JRS_EXTERNAL_SALES', 'OTICKET_PLAY') */
  productId: string;
  
  /** Nome do produto para logs */
  productName: string;
  
  /** Configuração do banco de dados */
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  
  /** Configuração de sincronização por tipo de venda */
  saleTypes: SaleTypeConfig[];
}

/**
 * Configuração de um tipo de venda específico
 */
export interface SaleTypeConfig {
  /** Tipo de venda no banco do produto (ex: 'online', 'pos_ticket') */
  saleTypeFilter: string;
  
  /** Tipo de referência no ERP (ex: 'TICKET_ONLINE_SALE', 'TICKET_POS_SALE') */
  referenceType: string;
  
  /** Nome da tabela no banco do produto */
  tableName: string;
  
  /** Query SQL customizada (opcional, usa padrão se não fornecido) */
  customQuery?: string;
  
  /** External source para identificar origem */
  externalSource: string;
}
