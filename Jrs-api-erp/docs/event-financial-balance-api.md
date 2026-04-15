# API de Saldo Financeiro por Evento

> **⚠️ IMPORTANTE PARA O FRONTEND:** 
> Use o campo `pending_balance` para exibir "Valor a Repassar". 
> Este campo já está calculado corretamente pelo backend considerando todos os repasses (solicitações + saques manuais).
> **NÃO** calcule manualmente no frontend e **NÃO** use `total_liabilities` diretamente.

# API de Saldo Financeiro por Evento

## Endpoint: `GET /financial_entry/events/financial-balance`

Endpoint específico para o financeiro/contabilidade visualizar o saldo detalhado por evento, incluindo quanto dinheiro está na empresa e quanto precisa ser repassado aos produtores.

---

## Parâmetros de Query (todos opcionais)

- `account_id` (UUID): Filtrar por conta específica
  - Se a conta for MASTER, retorna saldos de todas as contas
- `start_date` (ISO date string): Data inicial do período
  - Se fornecer apenas data (sem hora), ajusta automaticamente para início do dia (00:00:00)
- `end_date` (ISO date string): Data final do período
  - Se fornecer apenas data (sem hora), ajusta automaticamente para final do dia (23:59:59)
- `event_id` (string): Filtrar por ID do evento (busca exata)
  - Exemplo: `event_id=123` retorna apenas o evento com ID "123"
- `event_name` (string): Filtrar por nome do evento (busca parcial, case-insensitive)
  - Exemplo: `event_name=Rock` retorna eventos com "Rock Show", "Rock Festival", etc.

---

## Exemplos de Uso

### Exemplo 1: Todos os eventos de uma conta
```http
GET /financial_entry/events/financial-balance?account_id=xxx
```

### Exemplo 2: Eventos em um período específico
```http
GET /financial_entry/events/financial-balance?account_id=xxx&start_date=2026-01-01&end_date=2026-01-31
```

### Exemplo 3: Todos os eventos (se for conta MASTER)
```http
GET /financial_entry/events/financial-balance
```

### Exemplo 4: Filtrar por ID do evento
```http
GET /financial_entry/events/financial-balance?account_id=xxx&event_id=123
```

### Exemplo 5: Filtrar por nome do evento (busca parcial)
```http
GET /financial_entry/events/financial-balance?account_id=xxx&event_name=Rock
```

---

## Formato da Resposta

```json
[
  {
    "event_id": "123",
    "event_name": "Show de Rock",
    "total_revenue": 30000.00,
    "total_expenses": 5000.00,
    "total_liabilities": 20000.00,
    "total_repaid": 5000.00,
    "pending_balance": 15000.00,
    "balance": 5000.00,
    "transaction_count": 15,
    "first_transaction_date": "2026-01-15T10:00:00.000Z",
    "last_transaction_date": "2026-01-20T15:30:00.000Z"
  },
  {
    "event_id": "456",
    "event_name": "Festival de Música",
    "total_revenue": 50000.00,
    "total_expenses": 8000.00,
    "total_liabilities": 35000.00,
    "total_repaid": 10000.00,
    "pending_balance": 25000.00,
    "balance": 7000.00,
    "transaction_count": 25,
    "first_transaction_date": "2026-01-10T08:00:00.000Z",
    "last_transaction_date": "2026-01-25T20:00:00.000Z"
  }
]
```

---

## Campos da Resposta

### Informações do Evento
- **`event_id`** (string | null): ID do evento
- **`event_name`** (string | null): Nome do evento

### Valores Financeiros
- **`total_revenue`** (number): Total de receitas/entradas de dinheiro
  - Soma de todas as transações do tipo **ASSET** com **DEBIT**
  - Representa o dinheiro que entrou na empresa (ex: pagamentos de ingressos)

- **`total_expenses`** (number): Total de despesas com taxas
  - Soma de todas as transações do tipo **EXPENSE** com **DEBIT**
  - Representa despesas como: taxa de gateway, taxas administrativas

- **`total_liabilities`** (number): Total de obrigações a pagar ao produtor
  - Soma de todas as transações do tipo **LIABILITY** com **CREDIT**
  - **Este é o valor total que precisa ser repassado ao produtor** (antes de qualquer pagamento)
  - Representa o dinheiro que está na empresa mas pertence ao produtor

- **`total_repaid`** (number): Total já repassado ao produtor
  - Soma de todos os repasses já realizados (solicitações + saques manuais)
  - Inclui repasses de solicitações aprovadas (`PRODUCER_PAYOUT`)
  - Inclui saques manuais criados no ERP (`MANUAL_PAYOUT`)

- **`pending_balance`** (number): **⚠️ USE ESTE CAMPO PARA "VALOR A REPASSAR"**
  - Cálculo: `total_liabilities - total_repaid`
  - **Este é o valor que ainda falta repassar ao produtor**
  - Já está calculado corretamente pelo backend
  - **NÃO calcule manualmente no frontend**

- **`balance`** (number): Saldo líquido do evento
  - Cálculo: `total_revenue - total_expenses - total_liabilities`
  - Representa o lucro líquido que fica com a empresa após pagar todas as despesas e obrigações

### Informações Adicionais
- **`transaction_count`** (number): Quantidade de transações do evento
- **`first_transaction_date`** (string | null): Data da primeira transação (ISO 8601)
- **`last_transaction_date`** (string | null): Data da última transação (ISO 8601)

---

## Interpretação dos Valores

### Para o Financeiro/Contabilidade

**`total_liabilities`** = **Valor total a repassar ao produtor** (antes de pagamentos)
- Este é o valor total que precisa ser transferido ao produtor
- **NÃO use este campo diretamente** - ele não considera os repasses já feitos

**`pending_balance`** = **Valor pendente a repassar** ⚠️ **USE ESTE**
- Este é o valor que **ainda falta** repassar ao produtor
- Já considera todos os repasses já realizados (solicitações + saques manuais)
- **Use este campo para exibir "Valor a Repassar" no frontend**

**`balance`** = **Lucro líquido da empresa**
- É o que sobra para a empresa após:
  - Receber o dinheiro dos ingressos (`total_revenue`)
  - Pagar todas as taxas e despesas (`total_expenses`)
  - Repassar o valor devido ao produtor (`total_liabilities`)

**Exemplo prático:**
- Evento recebeu: R$ 30.000,00 (`total_revenue`)
- Despesas (taxas): R$ 5.000,00 (`total_expenses`)
- Total a repassar ao produtor: R$ 20.000,00 (`total_liabilities`)
- Já repassado: R$ 5.000,00 (`total_repaid`)
- **Pendente a repassar: R$ 15.000,00 (`pending_balance`)** ⚠️ **USE ESTE**
- Lucro da empresa: R$ 5.000,00 (`balance`)

---

## Ordenação

A lista é ordenada automaticamente por **saldo líquido** (maior para menor), facilitando a visualização dos eventos mais lucrativos primeiro.

---

## Exemplo de Uso no Frontend

```typescript
// Exemplo em TypeScript/React
interface EventFinancialBalance {
  event_id: string | null;
  event_name: string | null;
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number;        // Total já repassado
  pending_balance: number;     // ⚠️ USE ESTE para "Valor a Repassar"
  balance: number;
  transaction_count: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
}

const fetchEventFinancialBalance = async (filters: {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  eventName?: string;
}) => {
  const params = new URLSearchParams();
  
  if (filters.accountId) params.append('account_id', filters.accountId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.eventId) params.append('event_id', filters.eventId);
  if (filters.eventName) params.append('event_name', filters.eventName);

  const response = await fetch(
    `/financial_entry/events/financial-balance?${params}`
  );
  const data: EventFinancialBalance[] = await response.json();

  return data;
};

// Uso
const eventBalances = await fetchEventFinancialBalance({
  accountId: 'xxx',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});

// ⚠️ IMPORTANTE: Use pending_balance para "Valor a Repassar"
// Calcular totais gerais
const totalPendingToRepay = eventBalances.reduce(
  (sum, event) => sum + event.pending_balance, // ✅ Use pending_balance
  0
);

const totalRepaid = eventBalances.reduce(
  (sum, event) => sum + event.total_repaid,
  0
);

const totalProfit = eventBalances.reduce(
  (sum, event) => sum + event.balance,
  0
);


```

---

## Casos de Uso

### 1. Relatório para Contabilidade
Mostrar quanto dinheiro está na empresa que precisa ser repassado aos produtores:
```typescript
// ⚠️ Use pending_balance, não total_liabilities
const totalPendingToRepay = eventBalances.reduce(
  (sum, event) => sum + event.pending_balance, // ✅ Use este
  0
);
// Pendente a repassar: R$ X.XXX,XX
```

### 2. Dashboard Financeiro
Mostrar saldo por evento com destaque para valores a pagar:
- Eventos com `pending_balance > 0` precisam de atenção ⚠️ **Use pending_balance**
- Eventos com `balance < 0` estão com saldo negativo

### 3. Relatório de Repasse
Listar eventos ordenados por valor pendente a repassar:
```typescript
// ⚠️ Use pending_balance para filtrar e ordenar
const eventsToRepay = eventBalances
  .filter(event => event.pending_balance > 0) // ✅ Use pending_balance
  .sort((a, b) => b.pending_balance - a.pending_balance); // ✅ Use pending_balance
```

---

## Observações Importantes

1. **⚠️ USE `pending_balance` para "Valor a Repassar"**: 
   - O campo `pending_balance` já está calculado corretamente pelo backend
   - Ele considera todos os repasses já realizados (solicitações + saques manuais)
   - **NÃO** calcule manualmente no frontend
   - **NÃO** use `total_liabilities` diretamente (ele não considera repasses já feitos)

2. **Conta MASTER**: Se o `account_id` fornecido for de uma conta MASTER, o sistema retorna saldos de **todas as contas**, ignorando o filtro de conta.

3. **Atualização após criar saque manual**: 
   - Após criar um saque manual via `POST /producer_payout/manual`
   - **Recarregue os dados** chamando novamente este endpoint
   - O `pending_balance` será atualizado automaticamente
   - O `total_repaid` aumentará pelo valor do saque

4. **Filtro de Data**: 
   - Se fornecer apenas data (sem hora), o sistema ajusta automaticamente:
     - `start_date`: início do dia (00:00:00)
     - `end_date`: final do dia (23:59:59)
   - Se fornecer data com hora (formato ISO), usa exatamente como fornecido

5. **Apenas Eventos com event_id**: A rota retorna apenas eventos que têm `event_id` preenchido. Transações sem evento não aparecem na lista.

6. **Cálculo dos Valores**:
   - **Receita**: Apenas entradas de dinheiro (ASSET DEBIT)
   - **Despesas**: Apenas saídas de dinheiro por taxas (EXPENSE DEBIT)
   - **Obrigações**: Apenas valores a pagar (LIABILITY CREDIT)
   - **Repasses Pagos**: Soma de repasses já realizados (PRODUCER_PAYOUT + MANUAL_PAYOUT)
   - **Pendente**: `total_liabilities - total_repaid` (já calculado em `pending_balance`)
   - **Saldo**: Receita - Despesas - Obrigações

---

## Tratamento de Erros

- **400 Bad Request**: Parâmetros inválidos (datas inválidas, etc.)
- **200 OK**: Sempre retorna um array, mesmo que vazio `[]`

---

## Performance

- A rota busca todas as transações que atendem aos filtros e agrupa por evento
- Para grandes volumes de dados, considere usar filtros de data para limitar o escopo
- O índice em `event_id` ajuda na performance
- O índice em `entry_date` ajuda na performance de filtros por data
