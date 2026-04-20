import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SalesSyncStatusEntity } from './entities/sales-sync-status.entity';
import { FinancialPostingService } from '../financial_posting/financial_posting.service';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { ProductConfig, SaleTypeConfig } from './interfaces/product-config.interface';
import { getProductsConfig } from './config/products.config';

interface ClientSale {
  id: number;
  reference_id: string;
  account_code: string;
  total_paid_amount: number;
  ticket_amount: number;
  customer_fee_amount: number;
  producer_fee_amount: number;
  gateway_fee_amount: number;
  spread_customer_fee_amount: number;
  payment_method?: string;
  event_name?: string;
  event_id?: string;
  installments?: number;
  card_brand?: string;
  payment_id?: string;
  created_at: Date;
  sale_type: string;
  status: string;
}

@Injectable()
export class SalesSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SalesSyncService.name);
  private productDataSources: Map<string, DataSource> = new Map();
  private productsConfig: ProductConfig[] = [];

  constructor(
    @InjectRepository(SalesSyncStatusEntity)
    private readonly syncStatusRepository: Repository<SalesSyncStatusEntity>,
    @InjectRepository(FinancialEntryEntity)
    private readonly financialEntryRepository: Repository<FinancialEntryEntity>,
    private readonly dataSource: DataSource,
    private readonly financialPostingService: FinancialPostingService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Inicializar conexões com bancos de todos os produtos configurados
    // Usar ConfigService para garantir que as variáveis de ambiente estejam carregadas
    this.productsConfig = getProductsConfig(this.configService).filter((config) => {
      const hasConfig = 
        config.database.host &&
        config.database.port &&
        config.database.username &&
        config.database.password &&
        config.database.database;

      if (!hasConfig) {
        this.logger.warn(
          `⚠️  Configuração incompleta para ${config.productName}. Produto será ignorado.`,
        );
      }

      return hasConfig;
    });

    for (const productConfig of this.productsConfig) {
      try {
        // Configurar SSL: se for true, aceitar certificados auto-assinados
        const sslConfig = productConfig.database.ssl
          ? { rejectUnauthorized: false }
          : false;

        const dataSource = new DataSource({
          type: 'postgres',
          host: productConfig.database.host,
          port: productConfig.database.port,
          username: productConfig.database.username,
          password: productConfig.database.password,
          database: productConfig.database.database,
          ssl: sslConfig,
          logging: false,
        });

        await dataSource.initialize();
        this.productDataSources.set(productConfig.productId, dataSource);
        this.logger.log(
          `✅ Conexão com banco ${productConfig.productName} estabelecida`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Erro ao conectar com banco ${productConfig.productName}: ${error.message}`,
        );
      }
    }

    if (this.productDataSources.size === 0) {
      this.logger.warn('⚠️  Nenhuma conexão de banco estabelecida. Cron job desabilitado.');
    }
  }

  async onModuleDestroy() {
    // Encerrar todas as conexões
    for (const [productId, dataSource] of this.productDataSources.entries()) {
      if (dataSource?.isInitialized) {
        await dataSource.destroy();
        this.logger.log(`Conexão com banco ${productId} encerrada`);
      }
    }
    this.productDataSources.clear();
  }

  /**
   * Sincroniza vendas de todos os produtos configurados
   * Chamado manualmente via endpoint ou forceSync()
   */
  async handleSalesSync() {
    if (this.productDataSources.size === 0) {
      this.logger.debug('Nenhuma conexão de banco disponível');
      return;
    }

    this.logger.log('🔄 Iniciando sincronização de vendas...');

    try {
      // Sincronizar todos os produtos e todos os tipos de venda
      const syncPromises: Promise<void>[] = [];

      for (const productConfig of this.productsConfig) {
        const dataSource = this.productDataSources.get(productConfig.productId);
        if (!dataSource?.isInitialized) {
          continue;
        }

        for (const saleTypeConfig of productConfig.saleTypes) {
          const syncType = `${productConfig.productId}_${saleTypeConfig.referenceType}`;
          syncPromises.push(
            this.syncSalesByType(
              productConfig,
              saleTypeConfig,
              syncType,
              dataSource,
            ),
          );
        }
      }

      await Promise.all(syncPromises);
      this.logger.log('✅ Sincronização concluída');
    } catch (error) {
      this.logger.error(
        `❌ Erro na sincronização: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Sincroniza vendas de um tipo específico de um produto
   */
  private async syncSalesByType(
    productConfig: ProductConfig,
    saleTypeConfig: SaleTypeConfig,
    syncType: string,
    dataSource: DataSource,
  ) {
    try {
      // 1. Buscar ou criar status de sincronização
      let syncStatus = await this.syncStatusRepository.findOne({
        where: { sync_type: syncType },
      });

      if (!syncStatus) {
        syncStatus = this.syncStatusRepository.create({
          sync_type: syncType,
          last_synced_id: null,
          last_synced_date: null,
          total_synced: 0,
        });
        await this.syncStatusRepository.save(syncStatus);
      }

      // 2. Buscar vendas novas
      const sales = await this.fetchNewSalesFromDatabase(
        syncStatus,
        saleTypeConfig,
        dataSource,
      );

      if (sales.length === 0) {
        this.logger.debug(
          `Nenhuma venda nova encontrada para ${productConfig.productName} - ${saleTypeConfig.referenceType}`,
        );
        return;
      }

      this.logger.log(
        `📦 [${productConfig.productName}] Encontradas ${sales.length} vendas novas para ${saleTypeConfig.referenceType}`,
      );

      // 3. Processar cada venda
      let processed = 0;
      let lastId = syncStatus.last_synced_id || 0;
      let lastDate = syncStatus.last_synced_date;

      for (const sale of sales) {
        try {
          // Verificar se já foi processada (duplicata)
          // Verifica se existe qualquer entry com esse reference_id e reference_type
          const existingCount = await this.financialEntryRepository.count({
            where: {
              reference_id: String(sale.reference_id),
              reference_type: saleTypeConfig.referenceType,
            },
          });

          if (existingCount > 0) {
            this.logger.log(
              `⏭️  [${productConfig.productName}] Venda ${sale.reference_id} já processada (${existingCount} entries encontrados), pulando...`,
            );
            lastId = Math.max(lastId, sale.id);
            continue;
          }

          this.logger.debug(
            `🔄 [${productConfig.productName}] Processando venda ${sale.reference_id} (${saleTypeConfig.referenceType})...`,
          );

          // Processar venda
          await this.processSale(sale, saleTypeConfig, productConfig);

          // Verificar se foi realmente salvo (double-check)
          const savedCount = await this.financialEntryRepository.count({
            where: {
              reference_id: String(sale.reference_id),
              reference_type: saleTypeConfig.referenceType,
            },
          });

          if (savedCount === 0) {
            this.logger.warn(
              `⚠️  [${productConfig.productName}] Venda ${sale.reference_id} processada mas nenhum entry foi criado!`,
            );
          } else {
            this.logger.debug(
              `✅ [${productConfig.productName}] Venda ${sale.reference_id} processada com sucesso (${savedCount} entries criados)`,
            );
          }

          processed++;
          lastId = Math.max(lastId, sale.id);

          const saleDate = new Date(sale.created_at);
          if (!lastDate || saleDate > lastDate) {
            lastDate = saleDate;
          }
        } catch (error) {
          this.logger.error(
            `❌ [${productConfig.productName}] Erro ao processar venda ${sale.reference_id}: ${error.message}`,
            error.stack,
          );
          // Continuar processando outras vendas
        }
      }

      // 4. Atualizar status de sincronização
      // Sempre atualizar last_synced_id mesmo se não processou nada (para não buscar a mesma venda novamente)
      if (sales.length > 0) {
        syncStatus.last_synced_id = lastId;
        if (lastDate) {
          syncStatus.last_synced_date = lastDate;
        }
        syncStatus.total_synced += processed;
        await this.syncStatusRepository.save(syncStatus);
        
        this.logger.debug(
          `📝 Status atualizado: last_synced_id=${lastId}, total_synced=${syncStatus.total_synced}`,
        );

        this.logger.log(
          `✅ [${productConfig.productName}] ${processed} vendas processadas para ${saleTypeConfig.referenceType}. Total: ${syncStatus.total_synced}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Erro ao sincronizar ${productConfig.productName} - ${saleTypeConfig.referenceType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Busca vendas novas do banco de dados
   * Usa query customizada se fornecida, senão usa query padrão
   */
  private async fetchNewSalesFromDatabase(
    syncStatus: SalesSyncStatusEntity,
    saleTypeConfig: SaleTypeConfig,
    dataSource: DataSource,
  ): Promise<ClientSale[]> {
    if (!dataSource?.isInitialized) {
      return [];
    }

    // Usar query customizada se fornecida, senão usar padrão
    let query = saleTypeConfig.customQuery || this.getDefaultQuery(saleTypeConfig.tableName);
    const params: any[] = [];

    // NOTA: A query padrão não usa saleTypeFilter como parâmetro
    // Se precisar filtrar por tipo, adicione na query SQL diretamente

    // SEMPRE filtrar apenas vendas de 2026 (se não estiver na query customizada)
    // Este filtro DEVE estar presente para garantir que não pegue vendas de 2025
    // Usa timezone -03:00 (Brasil) para garantir que 2025-12-31 21:01 não seja incluído
    if (!saleTypeConfig.customQuery) {
      // Verificar se o filtro de ano já não está na query
      const hasYearFilter = query.includes('cs.created >= \'2026-01-01') || 
                           query.includes('EXTRACT(YEAR FROM cs.created)') ||
                           query.includes('DATE(cs.created)') ||
                           query.includes('YEAR FROM cs.created');
      
      if (!hasYearFilter) {
        query += ` AND cs.created >= '2026-01-01 00:00:00-03:00'::timestamptz AND cs.created < '2027-01-01 00:00:00-03:00'::timestamptz`;
        this.logger.debug('✅ Filtro de ano 2026 adicionado à query (com timezone -03:00)');
      } else {
        this.logger.debug('✅ Filtro de ano já presente na query');
      }
    }

    // Filtrar por último ID processado (mais eficiente)
    // IMPORTANTE: O filtro de 2026 acima já garante que não pegará vendas de 2025
    // mesmo que o last_synced_id seja de 2025
    if (syncStatus.last_synced_id) {
      query += ` AND cs.id > $${params.length + 1}`;
      params.push(syncStatus.last_synced_id);
    }
    // Ou filtrar por data (fallback) - mas garantir que seja de 2026
    else if (syncStatus.last_synced_date) {
      // Garantir que a data seja de 2026 ou posterior
      const minDate = new Date('2026-01-01T00:00:00.000Z');
      const lastDate = new Date(syncStatus.last_synced_date);
      const filterDate = lastDate < minDate ? minDate : lastDate;
      
      query += ` AND cs.created > $${params.length + 1}`;
      params.push(filterDate.toISOString());
    }

    // Ordenar e limitar (processar em lotes)
    query += ` ORDER BY cs.id ASC LIMIT 30`;

    // Debug: log da query completa e parâmetros
    this.logger.debug(
      `🔍 Query SQL completa: ${query} | Parâmetros: [${params.join(', ')}]`,
    );

    try {
      const result = await dataSource.query(query, params);
      
      // Debug: log primeira linha para verificar estrutura
      if (result.length > 0) {
        const firstRow = result[0];
        const createdDate = firstRow.created || firstRow.created_at;
        const year = createdDate ? new Date(createdDate).getFullYear() : 'N/A';
        
        this.logger.debug(
          `🔍 Primeira linha retornada do banco: ID=${firstRow.id}, created=${createdDate}, year=${year}`,
        );
        
        if (year !== 2026 && year !== 'N/A') {
          this.logger.warn(
            `⚠️  ATENÇÃO: Venda de ${year} retornada! Query pode ter problema no filtro de ano.`,
          );
        }
      }
      
      return result.map((row: any) => {
        const sale = {
          id: Number(row.id),
          reference_id: String(row.id || row.reference_id || ''),
          account_code: row.account_code || 'jrs-external-sales',
          total_paid_amount: Number(row.total_paid_amount || row.gross_amount || 0),
          ticket_amount: Number(row.ticket_amount || row.net_amount || 0),
          customer_fee_amount: Number(row.customer_fee_amount || 0),
          producer_fee_amount: Number(row.producer_fee_amount || 0),
          gateway_fee_amount: Number(row.gateway_fee_amount || 0),
          spread_customer_fee_amount: Number(row.spread_fee || 0),
          payment_method: row.payment_method || row.method || null,
          event_name: row.event_name || null,
          event_id: row.event_id || null,
          installments: row.installments ? Number(row.installments) : null,
          card_brand: row.card_brand || null,
          payment_id: row.payment_id || row.code || null,
          created_at: new Date(row.created_at || row.created),
          sale_type: row.sale_type || null,
          status: row.status,
        };
        
        // Debug: log se valores estiverem zerados
        if (sale.total_paid_amount === 0 && sale.ticket_amount === 0) {
          this.logger.warn(
            `⚠️  Venda ${sale.reference_id} com valores zerados. Dados originais: ${JSON.stringify(row)}`,
          );
        }
        
        return sale;
      });
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar vendas do banco: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Sincroniza uma venda específica por ID
   */
  async syncSpecificSale(
    saleId: number,
    productId: string,
    referenceType: string,
  ): Promise<{ success: boolean; message: string; sale?: any }> {
    try {
      // Encontrar configuração do produto
      const productConfig = this.productsConfig.find(
        (config) => config.productId === productId,
      );

      if (!productConfig) {
        return {
          success: false,
          message: `Produto ${productId} não encontrado ou não configurado`,
        };
      }

      // Encontrar configuração do tipo de venda
      const saleTypeConfig = productConfig.saleTypes.find(
        (type) => type.referenceType === referenceType,
      );

      if (!saleTypeConfig) {
        return {
          success: false,
          message: `Tipo de venda ${referenceType} não encontrado para o produto ${productId}`,
        };
      }

      // Obter conexão com o banco
      const dataSource = this.productDataSources.get(productId);
      if (!dataSource || !dataSource.isInitialized) {
        return {
          success: false,
          message: `Conexão com banco do produto ${productId} não está disponível`,
        };
      }

      // Buscar venda específica
      const sale = await this.fetchSaleById(saleId, saleTypeConfig, dataSource);

      if (!sale) {
        return {
          success: false,
          message: `Venda ${saleId} não encontrada no banco de dados`,
        };
      }

      // Verificar se já foi processada
      const existingCount = await this.financialEntryRepository.count({
        where: {
          reference_id: String(sale.reference_id),
          reference_type: saleTypeConfig.referenceType,
        },
      });

      if (existingCount > 0) {
        return {
          success: false,
          message: `Venda ${saleId} já foi processada (${existingCount} entries encontrados)`,
          sale,
        };
      }

      // Processar venda
      await this.processSale(sale, saleTypeConfig, productConfig);

      // Verificar se foi salvo
      const savedCount = await this.financialEntryRepository.count({
        where: {
          reference_id: String(sale.reference_id),
          reference_type: saleTypeConfig.referenceType,
        },
      });

      if (savedCount === 0) {
        return {
          success: false,
          message: `Venda ${saleId} processada mas nenhum entry foi criado`,
          sale,
        };
      }

      return {
        success: true,
        message: `Venda ${saleId} sincronizada com sucesso (${savedCount} entries criados)`,
        sale,
      };
    } catch (error) {
      this.logger.error(
        `❌ Erro ao sincronizar venda ${saleId}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Erro ao sincronizar venda: ${error.message}`,
      };
    }
  }

  /**
   * Busca uma venda específica por ID do banco de dados
   */
  private async fetchSaleById(
    saleId: number,
    saleTypeConfig: SaleTypeConfig,
    dataSource: DataSource,
  ): Promise<ClientSale | null> {
    if (!dataSource?.isInitialized) {
      return null;
    }

    // Usar query customizada se fornecida, senão usar padrão
    let query = saleTypeConfig.customQuery || this.getDefaultQuery(saleTypeConfig.tableName);
    const params: any[] = [];

    // Filtrar por ID específico
    query += ` AND cs.id = $${params.length + 1}`;
    params.push(saleId);

    // Limitar a 1 resultado
    query += ` LIMIT 1`;

    this.logger.debug(
      `🔍 Buscando venda específica: ID=${saleId} | Query: ${query.substring(0, 200)}...`,
    );

    try {
      const result = await dataSource.query(query, params);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      const sale: ClientSale = {
        id: Number(row.id),
        reference_id: String(row.id || row.reference_id || ''),
        account_code: row.account_code || 'jrs-external-sales',
        total_paid_amount: Number(row.total_paid_amount || row.gross_amount || 0),
        ticket_amount: Number(row.ticket_amount || row.net_amount || 0),
        customer_fee_amount: Number(row.customer_fee_amount || 0),
        producer_fee_amount: Number(row.producer_fee_amount || 0),
        gateway_fee_amount: Number(row.gateway_fee_amount || 0),
        spread_customer_fee_amount: Number(row.spread_customer_fee_amount || 0),
        payment_method: row.payment_method || row.method || null,
        event_name: row.event_name || null,
        event_id: row.event_id || null,
        installments: row.installments ? Number(row.installments) : undefined,
        card_brand: row.card_brand || null,
        payment_id: row.payment_id || row.code || null,
        created_at: new Date(row.created_at || row.created),
        sale_type: row.sale_type || null,
        status: row.status,
      };

      return sale;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar venda ${saleId} do banco: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Retorna query SQL padrão
   * Pode ser sobrescrita por query customizada na configuração
   * NOTA: Esta query não usa parâmetros ($1), então não adicione saleTypeFilter aos params
   */
  private getDefaultQuery(tableName: string): string {
    return `
      SELECT 
        cs.id,
        cs.id::text as reference_id,
        'jrs-external-sales' as account_code,
        COALESCE(cs.gross_amount, 0) as total_paid_amount,
        COALESCE(cs.net_amount, 0) as ticket_amount,
        COALESCE(cs.producer_fee_amount, 0) as producer_fee_amount,
        COALESCE(cs.spread_fee, 0) as spread_customer_fee_amount,
        COALESCE(cs.fee_amount, 0) as customer_fee_amount,
        cs.method as payment_method,
        cs.installments,
        cs.card_brand,
        cs.code as payment_id,
        cs.created as created_at,
        cs.status,
        ae.name as event_name,
        ae.id as event_id
      FROM ${tableName} cs
       inner join clients_saleitem cs2 on cs2.sale_id = cs.id
     inner join administrator_lot al on al.id = cs2.lot_id 
     inner join administrator_event ae on ae.id = al.event_id 
      WHERE cs.status = 3
        AND cs.created >= '2026-01-01 00:00:00-03:00'::timestamptz
        AND cs.created < '2027-01-01 00:00:00-03:00'::timestamptz
    `;
  }

  /**
   * Processa uma venda específica e envia para o ERP
   */
  private async processSale(
    sale: ClientSale,
    saleTypeConfig: SaleTypeConfig,
    productConfig: ProductConfig,
  ) {
    // Log dos dados antes de processar
    this.logger.debug(
      `📊 Processando venda ${sale.reference_id}: total_paid=${sale.total_paid_amount}, ticket=${sale.ticket_amount}`,
    );



    const saleData = {
      account_code: sale.account_code,
      external_source: saleTypeConfig.externalSource,
      reference_id: String(sale.reference_id),
      customer_fee_amount: sale.customer_fee_amount || 0,
      producer_fee_amount: sale.producer_fee_amount || 0,
      total_paid_amount: sale.total_paid_amount,
      ticket_amount: sale.ticket_amount || sale.total_paid_amount,
      gateway_fee_amount: sale.gateway_fee_amount || 0,
      spread_customer_fee_amount: sale.spread_customer_fee_amount || 0,
      payment_method: sale.payment_method,
      event_name: sale.event_name,
      event_id: sale.event_id,
      installments: sale.installments,
      sale_created_at: sale.created_at,
      card_brand: sale.card_brand,
      payment_id: sale.payment_id,
    };

    // Log se valores estiverem zerados
    if (saleData.total_paid_amount === 0) {
      this.logger.warn(
        `⚠️  Venda ${sale.reference_id} tem total_paid_amount = 0. Dados: ${JSON.stringify(saleData)}`,
      );
    }

    // Chamar o método apropriado baseado no tipo
    switch (saleTypeConfig.referenceType) {
      case 'TICKET_ONLINE_SALE':
        await this.financialPostingService.createTicketOnlineSale(saleData);
        break;

      // case 'TICKET_POS_SALE':
      //   // Por enquanto usa o mesmo método
      //   await this.financialPostingService.createTicketOnlineSale(saleData);
      //   this.logger.warn(
      //     `⚠️  TICKET_POS_SALE usando createTicketOnlineSale - considerar criar método específico`,
      //   );
      //   break;

      // case 'PRODUCT_POS_SALE':
      //   this.logger.warn('⚠️  Método para PRODUCT_POS_SALE ainda não implementado');
      //   break;

      default:
        throw new Error(
          `Tipo de venda desconhecido: ${saleTypeConfig.referenceType}`,
        );
    }
  }

  /**
   * Método manual para forçar sincronização (útil para testes)
   */
  async forceSync(productId?: string, referenceType?: string) {
    if (this.productDataSources.size === 0) {
      throw new Error('Nenhuma conexão de banco disponível');
    }

    if (productId && referenceType) {
      // Sincronizar tipo específico de um produto específico
      const productConfig = this.productsConfig.find(
        (p) => p.productId === productId,
      );
      if (!productConfig) {
        throw new Error(`Produto não encontrado: ${productId}`);
      }

      const saleTypeConfig = productConfig.saleTypes.find(
        (st) => st.referenceType === referenceType,
      );
      if (!saleTypeConfig) {
        throw new Error(
          `Tipo de venda não encontrado: ${referenceType} para produto ${productId}`,
        );
      }

      const dataSource = this.productDataSources.get(productId);
      if (!dataSource?.isInitialized) {
        throw new Error(`Conexão com banco ${productId} não disponível`);
      }

      const syncType = `${productId}_${referenceType}`;
      return this.syncSalesByType(
        productConfig,
        saleTypeConfig,
        syncType,
        dataSource,
      );
    } else if (productId) {
      // Sincronizar todos os tipos de um produto específico
      const productConfig = this.productsConfig.find(
        (p) => p.productId === productId,
      );
      if (!productConfig) {
        throw new Error(`Produto não encontrado: ${productId}`);
      }

      const dataSource = this.productDataSources.get(productId);
      if (!dataSource?.isInitialized) {
        throw new Error(`Conexão com banco ${productId} não disponível`);
      }

      const promises = productConfig.saleTypes.map((saleTypeConfig) => {
        const syncType = `${productId}_${saleTypeConfig.referenceType}`;
        return this.syncSalesByType(
          productConfig,
          saleTypeConfig,
          syncType,
          dataSource,
        );
      });

      return Promise.all(promises);
    }

    // Sincronizar tudo
    return this.handleSalesSync();
  }

  /**
   * Retorna status das sincronizações
   */
  async getSyncStatus() {
    const statuses = await this.syncStatusRepository.find({
      order: { sync_type: 'ASC' },
    });

    return statuses.map((status) => ({
      sync_type: status.sync_type,
      last_synced_id: status.last_synced_id,
      last_synced_date: status.last_synced_date,
      total_synced: status.total_synced,
      updated_at: status.updated_at,
    }));
  }

  /**
   * Retorna lista de produtos configurados
   */
  getConfiguredProducts() {
    return this.productsConfig.map((config) => ({
      productId: config.productId,
      productName: config.productName,
      isConnected: this.productDataSources.get(config.productId)?.isInitialized || false,
      saleTypes: config.saleTypes.map((st) => st.referenceType),
    }));
  }
}
