# Cron Job de Sincronização de Vendas

Este documento explica como funciona o cron job que monitora as tabelas de vendas dos produtos (OTicket Eventos, OTicket Play, etc.) e sincroniza as vendas para o ERP.

## 🎯 Suporte a Múltiplos Produtos

O sistema foi projetado para suportar **múltiplos produtos** de forma escalável. Cada produto pode ter:
- Seu próprio banco de dados
- Suas próprias configurações de sincronização
- Queries SQL customizadas (se necessário)

## 📋 Visão Geral

O cron job executa automaticamente a cada **5 minutos** e:
1. Conecta ao banco de dados do OTicket Eventos
2. Busca vendas novas na tabela `clients_sale`
3. Verifica se já foram processadas (evita duplicatas)
4. Processa e envia para o ERP via `FinancialPostingService`
5. Atualiza o status de sincronização

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione as variáveis de ambiente para cada produto no arquivo `.env.local`:

```env
# Banco do produto OTicket Eventos
OTICKET_EVENTOS_DB_HOST=seu-host-aqui
OTICKET_EVENTOS_DB_PORT=5432
OTICKET_EVENTOS_DB_USERNAME=seu-usuario
OTICKET_EVENTOS_DB_PASSWORD=sua-senha
OTICKET_EVENTOS_DB_DATABASE=nome-do-banco
OTICKET_EVENTOS_DB_SSL=true

# Banco do produto OTicket Play (quando estiver pronto)
OTICKET_PLAY_DB_HOST=seu-host-aqui
OTICKET_PLAY_DB_PORT=5432
OTICKET_PLAY_DB_USERNAME=seu-usuario
OTICKET_PLAY_DB_PASSWORD=sua-senha
OTICKET_PLAY_DB_DATABASE=nome-do-banco
OTICKET_PLAY_DB_SSL=true
```

### 2. Executar Migration

Execute a migration para criar a tabela de status de sincronização:

```bash
npm run migration:run
```

## 🔄 Como Funciona

### Arquitetura Multi-Produto

O sistema usa uma arquitetura baseada em **configuração** (`products.config.ts`), onde cada produto é definido com:
- Configuração do banco de dados
- Tipos de vendas a sincronizar
- Nome da tabela
- Query SQL (opcional, usa padrão se não fornecido)

### Tipos de Vendas Sincronizadas

Cada produto pode ter seus próprios tipos de vendas. Por padrão, o OTicket Eventos tem:

1. **TICKET_ONLINE_SALE** (`sale_type = 'online'`)
   - Vendas de ingressos online
   - Processadas via `createTicketOnlineSale()`

2. **TICKET_POS_SALE** (`sale_type = 'pos_ticket'`)
   - Vendas de ingressos presencial
   - Processadas via `createTicketOnlineSale()` (temporário)

3. **PRODUCT_POS_SALE** (`sale_type = 'pos_product'`)
   - Vendas de produtos presencial
   - Ainda não implementado

### Rastreamento de Sincronização

A tabela `erp_sales_sync_status` armazena:
- `sync_type`: Tipo de sincronização no formato `PRODUCT_ID_REFERENCE_TYPE` (ex: `OTICKET_EVENTOS_TICKET_ONLINE_SALE`)
- `last_synced_id`: Último ID processado (evita reprocessar)
- `last_synced_date`: Última data processada
- `total_synced`: Total de vendas sincronizadas

Cada combinação de produto + tipo de venda tem seu próprio registro de sincronização.

### Prevenção de Duplicatas

Antes de processar cada venda, o sistema verifica se já existe um `FinancialEntry` com o mesmo `reference_id` e `reference_type`. Se existir, a venda é pulada.

## 🛠️ Uso Manual

### Forçar Sincronização

Você pode forçar uma sincronização manualmente via API:

```bash
# Sincronizar todos os produtos e tipos
POST /sales-sync/sync

# Sincronizar todos os tipos de um produto específico
POST /sales-sync/sync?productId=OTICKET_EVENTOS

# Sincronizar tipo específico de um produto específico
POST /sales-sync/sync?productId=OTICKET_EVENTOS&referenceType=TICKET_ONLINE_SALE
POST /sales-sync/sync?productId=OTICKET_PLAY&referenceType=TICKET_ONLINE_SALE
```

### Listar Produtos Configurados

```bash
GET /sales-sync/products
```

Resposta:
```json
{
  "products": [
    {
      "productId": "OTICKET_EVENTOS",
      "productName": "OTicket Eventos",
      "isConnected": true,
      "saleTypes": ["TICKET_ONLINE_SALE", "TICKET_POS_SALE", "PRODUCT_POS_SALE"]
    }
  ]
}
```

### Verificar Status

```bash
GET /sales-sync/status
```

Resposta:
```json
{
  "status": "ok",
  "syncs": [
    {
      "sync_type": "TICKET_ONLINE_SALE",
      "last_synced_id": 12345,
      "last_synced_date": "2026-01-15T10:30:00Z",
      "total_synced": 150,
      "updated_at": "2026-01-15T10:35:00Z"
    }
  ]
}
```

## 📊 Query SQL

O cron job executa uma query SQL na tabela `clients_sale`. **IMPORTANTE**: Ajuste os nomes das colunas conforme sua estrutura real.

A query atual assume a seguinte estrutura:

```sql
SELECT 
  cs.id,
  COALESCE(cs.sale_number, cs.id::text) as reference_id,
  COALESCE(a.code, cs.account_code) as account_code,
  -- ... outros campos
FROM clients_sale cs
LEFT JOIN accounts a ON cs.account_id = a.id
LEFT JOIN payments p ON cs.payment_id = p.id
LEFT JOIN events e ON cs.event_id = e.id
WHERE cs.status = 'paid'
  AND COALESCE(cs.sale_type, cs.type) = $1
  AND cs.id > $2  -- Filtro por último ID processado
ORDER BY cs.id ASC
LIMIT 100
```

### Ajustes Necessários

Se sua estrutura for diferente, edite o método `fetchNewSalesFromDatabase()` em `sales-sync.service.ts` e ajuste:

- Nomes das colunas
- Nomes das tabelas relacionadas
- Filtros de status
- Mapeamento de campos

## 🔍 Logs

O cron job gera logs detalhados:

- `🔄 Iniciando sincronização de vendas...`
- `📦 Encontradas X vendas novas para TICKET_ONLINE_SALE`
- `✅ X vendas processadas para TICKET_ONLINE_SALE. Total: Y`
- `❌ Erro ao processar venda...`

## ⚠️ Troubleshooting

### Cron não está executando

1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs da aplicação
3. Verifique se a conexão com o banco OTicket Eventos está funcionando

### Vendas não estão sendo processadas

1. Verifique se as vendas têm `status = 'paid'`
2. Verifique se o `sale_type` corresponde aos filtros
3. Verifique se já não foram processadas (duplicatas)
4. Verifique os logs de erro

### Erro de conexão com banco

1. Verifique as credenciais no `.env.local`
2. Verifique se o banco está acessível
3. Verifique se o SSL está configurado corretamente

## ➕ Adicionar Novo Produto

Para adicionar um novo produto (ex: OTicket Play):

1. **Adicionar variáveis de ambiente** no `.env.local`:
```env
OTICKET_PLAY_DB_HOST=...
OTICKET_PLAY_DB_PORT=...
OTICKET_PLAY_DB_USERNAME=...
OTICKET_PLAY_DB_PASSWORD=...
OTICKET_PLAY_DB_DATABASE=...
OTICKET_PLAY_DB_SSL=true
```

2. **Editar `src/modules/sales_sync/config/products.config.ts`** e descomentar/adicionar a configuração:
```typescript
{
  productId: 'OTICKET_PLAY',
  productName: 'OTicket Play',
  database: {
    host: process.env.OTICKET_PLAY_DB_HOST || '',
    // ... outras configurações
  },
  saleTypes: [
    {
      saleTypeFilter: 'online',
      referenceType: 'TICKET_ONLINE_SALE',
      tableName: 'sales', // Pode ter nome diferente
      externalSource: 'OTICKET_PLAY',
      // customQuery: 'SELECT ...' // Opcional: query customizada
    },
  ],
}
```

3. **Reiniciar a aplicação** - O sistema detectará automaticamente e iniciará a sincronização!

## 📝 Próximos Passos

- [ ] Implementar método `createTicketPOSSale()` específico
- [ ] Implementar método para `PRODUCT_POS_SALE`
- [ ] Adicionar retry automático em caso de falha
- [ ] Adicionar métricas e monitoramento
- [ ] Adicionar notificações em caso de erro
- [ ] Suporte a queries SQL completamente customizadas por produto