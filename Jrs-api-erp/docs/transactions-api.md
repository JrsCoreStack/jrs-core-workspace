# API de Transações Financeiras

## Endpoint: `GET /financial_entry/transactions`

Endpoint para listar transações financeiras com paginação, filtros avançados e consolidado financeiro.

---

## Parâmetros de Query (todos opcionais)

### Paginação
- `page` (number, default: 1): Número da página
- `limit` (number, default: 20, max: 100): Quantidade de itens por página
- `offset` (number): Offset direto (alternativa ao page)

### Filtros
- `account_id` (UUID): Filtrar por conta específica
  - Se a conta for MASTER, retorna transações de todas as contas
- `chart_of_account_id` (UUID): Filtrar por plano de contas específico
- `type` (enum: `DEBIT` | `CREDIT`): Filtrar por tipo de lançamento
- `reference_type` (string): Filtrar por tipo de referência (ex: "TICKET_ONLINE_SALE")
- `reference_id` (string): Filtrar por ID de referência (busca exata)
- `external_source` (string): Filtrar por origem externa
- `start_date` (ISO date string): Data inicial do período
- `end_date` (ISO date string): Data final do período
- `description` (string): Busca parcial no campo descrição (case-insensitive)
- `event_id` (string): Filtrar por ID do evento (busca exata)
- `event_name` (string): Busca parcial no nome do evento (case-insensitive)
- `payment_id` (string): Filtrar por ID do pagamento (busca exata)

### Ordenação
- `order_by` (string, default: `entry_date`): Campo para ordenação
  - Valores aceitos: `entry_date`, `created_at`, `amount`
- `order_direction` (string, default: `DESC`): Direção da ordenação
  - Valores aceitos: `ASC`, `DESC`

### Agrupamento
- `group_by_reference` (boolean, default: `false`): Agrupar transações por `reference_id`
  - Quando `true`, retorna grupos de transações ao invés de transações individuais
  - Cada grupo contém: `reference_id`, `total`, `transaction_count`, `date`, `transactions[]`

---

## Exemplos de Uso

### Exemplo 1: Listar transações básicas
```http
GET /financial_entry/transactions?page=1&limit=20&account_id=xxx
```

### Exemplo 2: Filtrar por período
```http
GET /financial_entry/transactions?account_id=xxx&start_date=2026-01-01&end_date=2026-01-31
```

### Exemplo 3: Filtrar por evento
```http
GET /financial_entry/transactions?account_id=xxx&event_id=123&event_name=Show
```

### Exemplo 6: Filtrar por payment_id
```http
GET /financial_entry/transactions?account_id=xxx&payment_id=pay_123456789
```

### Exemplo 4: Agrupar por referência
```http
GET /financial_entry/transactions?account_id=xxx&group_by_reference=true&page=1&limit=10
```

### Exemplo 5: Buscar transação específica por reference_id
```http
GET /financial_entry/transactions?account_id=xxx&reference_id=887807&group_by_reference=true
```

---

## Formato da Resposta

### Modo Normal (sem agrupamento)

```json
{
  "data": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "chart_of_account_id": "uuid",
      "type": "DEBIT",
      "amount": "300.00",
      "description": "Entrada pagamento ingresso online",
      "reference_id": "887807",
      "reference_type": "TICKET_ONLINE_SALE",
      "external_source": "EVENT_ADMIN_WEB",
      "entry_date": "2026-01-15T10:00:00.000Z",
      "payment_method": "credit_card",
      "event_name": "Show de Rock",
      "event_id": "123",
      "installments": 3,
      "card_brand": "Visa",
      "payment_id": "pay_123456789",
      "created_at": "2026-01-15T10:00:00.000Z",
      "updated_at": "2026-01-15T10:00:00.000Z",
      "account": {
        "id": "uuid",
        "name": "Nome da Conta",
        "code": "001"
      },
      "chart_of_account": {
        "id": "uuid",
        "code": "1.1.2",
        "name": "Gateway de Pagamento",
        "type": "ASSET"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "consolidated": {
    "total_revenue": 30000.00,
    "total_expenses": 5000.00,
    "total_liabilities": 20000.00,
    "profit": 5000.00
  }
}
```

### Modo Agrupado (group_by_reference=true)

```json
{
  "data": [
    {
      "reference_id": "887807",
      "total": 100.00,
      "transaction_count": 6,
      "date": "2026-01-15T10:00:00.000Z",
      "transactions": [
        {
          "id": "uuid",
          "type": "DEBIT",
          "amount": "300.00",
          "description": "Entrada pagamento ingresso online",
          "chart_of_account": {
            "type": "ASSET"
          }
        },
        {
          "id": "uuid",
          "type": "CREDIT",
          "amount": "200.00",
          "description": "Valor a repassar ao produtor",
          "chart_of_account": {
            "type": "LIABILITY"
          }
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "consolidated": {
    "total_revenue": 30000.00,
    "total_expenses": 5000.00,
    "total_liabilities": 20000.00,
    "profit": 5000.00
  }
}
```

---

## Campos do Consolidado

O campo `consolidated` está sempre presente na resposta e contém os totais calculados com base em **todas as transações que atendem aos filtros** (não apenas a página atual):

- **`total_revenue`** (number): Total de receitas/entradas de dinheiro
  - Soma de todas as transações do tipo ASSET com DEBIT
  - Exemplo: Entrada de pagamento de ingresso

- **`total_expenses`** (number): Total de despesas com taxas
  - Soma de todas as transações do tipo EXPENSE com DEBIT
  - Exemplo: Taxa de gateway, taxas administrativas

- **`total_liabilities`** (number): Total de obrigações a pagar
  - Soma de todas as transações do tipo LIABILITY com CREDIT
  - Exemplo: Valor a repassar ao produtor

- **`profit`** (number): Lucro líquido
  - Cálculo: `total_revenue - total_expenses - total_liabilities`
  - Representa o que sobrou após pagar todas as despesas e obrigações

---

## Campos das Transações

### Campos Principais
- `id`: UUID da transação
- `account_id`: UUID da conta
- `chart_of_account_id`: UUID do plano de contas
- `type`: Tipo de lançamento (`DEBIT` ou `CREDIT`)
- `amount`: Valor da transação (decimal)
- `description`: Descrição da transação
- `entry_date`: Data do lançamento (ISO 8601)

### Campos de Referência
- `reference_id`: ID de referência da transação (ex: ID da venda)
- `reference_type`: Tipo de referência (ex: "TICKET_ONLINE_SALE")
- `external_source`: Origem externa da transação

### Campos de Evento
- `event_id`: ID do evento (string)
- `event_name`: Nome do evento (string)

### Campos de Pagamento
- `payment_method`: Método de pagamento (ex: "credit_card", "pix")
- `installments`: Número de parcelas (number)
- `card_brand`: Bandeira do cartão (ex: "Visa", "MasterCard")
- `payment_id`: ID do pagamento (string, ex: "pay_123456789")

### Relações
- `account`: Objeto com dados da conta
- `chart_of_account`: Objeto com dados do plano de contas
  - `type`: Tipo da conta (`ASSET`, `LIABILITY`, `INCOME`, `EXPENSE`)

---

## Lógica de Cálculo do Consolidado

### Receita (total_revenue)
- Conta: Transações do tipo **ASSET** com **DEBIT**
- Exemplo: Entrada de dinheiro no banco/gateway

### Despesas (total_expenses)
- Conta: Transações do tipo **EXPENSE** com **DEBIT**
- Exemplo: Taxa de gateway, taxas administrativas

### Obrigações (total_liabilities)
- Conta: Transações do tipo **LIABILITY** com **CREDIT**
- Exemplo: Valor a repassar ao produtor

### Lucro (profit)
- Cálculo: `receita - despesas - obrigações`
- Representa o saldo líquido após todas as movimentações

---

## Observações Importantes

1. **Conta MASTER**: Se o `account_id` fornecido for de uma conta MASTER, o sistema retorna transações de **todas as contas**, ignorando o filtro de conta.

2. **Consolidado**: O consolidado é calculado com base em **todas as transações** que atendem aos filtros, independente da paginação. Isso significa que mesmo na página 1, o consolidado mostra os totais de todas as páginas.

3. **Agrupamento**: Quando `group_by_reference=true`, as transações são agrupadas por `reference_id`. O campo `total` de cada grupo é calculado considerando movimentações reais de dinheiro (ASSET, LIABILITY, EXPENSE) e receitas (INCOME), como a taxa administrativa do produtor. Receitas com CREDIT aumentam o saldo e receitas com DEBIT diminuem o saldo.

4. **Filtro de Data**: 
   - Se fornecer apenas data (sem hora), o sistema ajusta automaticamente:
     - `start_date`: início do dia (00:00:00)
     - `end_date`: final do dia (23:59:59)
   - Se fornecer data com hora (formato ISO), usa exatamente como fornecido

5. **Filtro de Evento**:
   - `event_id`: Busca exata (deve corresponder exatamente)
   - `event_name`: Busca parcial (case-insensitive)

6. **Filtro de Pagamento**:
   - `payment_id`: Busca exata (deve corresponder exatamente ao ID do pagamento)

---

## Exemplo Completo de Uso no Frontend

```typescript
// Exemplo em TypeScript/React
const fetchTransactions = async (filters: {
  accountId: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  eventName?: string;
  paymentId?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams({
    account_id: filters.accountId,
    page: String(filters.page || 1),
    limit: String(filters.limit || 20),
  });

  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.eventId) params.append('event_id', filters.eventId);
  if (filters.paymentId) params.append('payment_id', filters.paymentId);

  const response = await fetch(`/financial_entry/transactions?${params}`);
  const data = await response.json();

  return {
    transactions: data.data,
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    },
    consolidated: data.consolidated, // Sempre presente
  };
};

// Uso
const result = await fetchTransactions({
  accountId: 'xxx',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  page: 1,
  limit: 20,
});


```

---

## Tratamento de Erros

- **400 Bad Request**: Parâmetros inválidos (datas inválidas, valores fora do range, etc.)
- **404 Not Found**: Recurso não encontrado (quando usar filtros específicos que não retornam resultados)

---

## Performance

- O consolidado é calculado com uma query adicional que busca todas as transações que atendem aos filtros
- Para grandes volumes de dados, considere usar filtros de data para limitar o escopo
- O índice em `entry_date` ajuda na performance de filtros por data
- Índices em `event_id`, `payment_method` e `account_id` também melhoram a performance
