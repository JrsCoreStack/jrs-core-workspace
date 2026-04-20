import { ProductConfig } from '../interfaces/product-config.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Função para obter configuração de produtos
 * Usa ConfigService para garantir que as variáveis de ambiente estejam carregadas
 */
export function getProductsConfig(configService: ConfigService): ProductConfig[] {
  return [
    {
      productId: 'JRS_EXTERNAL_SALES',
      productName: 'Vendas — projeto integrado',
      database: {
        host: configService.get<string>('JRS_EXTERNAL_SALES_DB_HOST') || '',
        port: Number(configService.get<string>('JRS_EXTERNAL_SALES_DB_PORT') || 5432),
        username: configService.get<string>('JRS_EXTERNAL_SALES_DB_USERNAME') || '',
        password: configService.get<string>('JRS_EXTERNAL_SALES_DB_PASSWORD') || '',
        database: configService.get<string>('JRS_EXTERNAL_SALES_DB_DATABASE') || '',
        ssl: configService.get<string>('JRS_EXTERNAL_SALES_DB_SSL') === 'true',
      },
    saleTypes: [
      {
        saleTypeFilter: 'online',
        referenceType: 'TICKET_ONLINE_SALE',
        tableName: 'clients_sale',
        externalSource: 'JRS_EXTERNAL_SALES',
      },
      {
        saleTypeFilter: 'pos_ticket',
        referenceType: 'TICKET_POS_SALE',
        tableName: 'clients_sale',
        externalSource: 'JRS_EXTERNAL_SALES',
      },
      {
        saleTypeFilter: 'pos_product',
        referenceType: 'PRODUCT_POS_SALE',
        tableName: 'clients_sale',
        externalSource: 'JRS_EXTERNAL_SALES',
      },
    ],
  },
    // Exemplo de configuração para OTicket Play (descomentar quando estiver pronto)
    // {
    //   productId: 'OTICKET_PLAY',
    //   productName: 'OTicket Play',
    //   database: {
    //     host: configService.get<string>('OTICKET_PLAY_DB_HOST') || '',
    //     port: Number(configService.get<string>('OTICKET_PLAY_DB_PORT') || 5432),
    //     username: configService.get<string>('OTICKET_PLAY_DB_USERNAME') || '',
    //     password: configService.get<string>('OTICKET_PLAY_DB_PASSWORD') || '',
    //     database: configService.get<string>('OTICKET_PLAY_DB_DATABASE') || '',
    //     ssl: configService.get<string>('OTICKET_PLAY_DB_SSL') === 'true',
    //   },
    //   saleTypes: [
    //     {
    //       saleTypeFilter: 'online',
    //       referenceType: 'TICKET_ONLINE_SALE',
    //       tableName: 'sales', // Pode ter nome diferente
    //       externalSource: 'OTICKET_PLAY',
    //     },
    //   ],
    // },
  ];
}
