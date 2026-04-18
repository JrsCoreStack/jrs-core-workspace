# Guia Frontend - Saldo de Eventos e Repasses

Esta documentação explica como o frontend deve exibir corretamente os saldos dos eventos, considerando os repasses já realizados (tanto de solicitações quanto de saques manuais).

## Endpoints Disponíveis

### 1. Lista Detalhada de Eventos

**GET** `/financial_entry/events/financial-balance`

Retorna a lista detalhada de cada evento com seus saldos individuais.

**Query Parameters:**
- `account_id` (string, opcional): ID da conta
- `start_date` (string, opcional): Data inicial (ISO format)
- `end_date` (string, opcional): Data final (ISO format)
- `event_id` (string, opcional): ID do evento (busca exata)
- `event_name` (string, opcional): Nome do evento (busca parcial, case-insensitive)

**Exemplo de Requisição:**
```http
GET /financial_entry/events/financial-balance?account_id=5127ca53-20f9-46ba-9ece-d0a9fb94d7eb
```

### 2. Totais Consolidados (NOVO) ⭐

**GET** `/financial_entry/events/financial-balance/summary`

Retorna os totais consolidados (soma de todos os eventos) - **use este para o dashboard!**

**Query Parameters:**
- `account_id` (string, opcional): ID da conta
- `start_date` (string, opcional): Data inicial (ISO format)
- `end_date` (string, opcional): Data final (ISO format)
- `event_id` (string, opcional): ID do evento (busca exata)
- `event_name` (string, opcional): Nome do evento (busca parcial, case-insensitive)

**Exemplo de Requisição:**
```http
GET /financial_entry/events/financial-balance/summary?account_id=5127ca53-20f9-46ba-9ece-d0a9fb94d7eb
```

**Exemplo de Resposta:**
```json
{
  "total_revenue": 876.15,
  "total_expenses": 9.57,
  "total_liabilities": 785.00,
  "total_repaid": 100.00,
  "total_pending_balance": 685.00,
  "total_balance": 81.58,
  "event_count": 1,
  "total_transaction_count": 14
}
```

**✅ RECOMENDAÇÃO**: Use este endpoint para exibir os totais no dashboard, ao invés de calcular no frontend!

## Estrutura da Resposta

A resposta é um array de objetos, cada um representando o saldo financeiro de um evento:

```typescript
interface EventFinancialBalance {
  event_id: string | null;
  event_name: string | null;
  total_revenue: number;        // Total de receitas (entradas de dinheiro)
  total_expenses: number;        // Total de despesas (taxas, custos)
  total_liabilities: number;     // Total de obrigações (valor total a repassar ao produtor)
  total_repaid: number;          // Total já repassado (solicitações + saques manuais)
  pending_balance: number;       // Saldo pendente a repassar (total_liabilities - total_repaid)
  balance: number;               // Saldo líquido do evento (receita - despesas - obrigações)
  transaction_count: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
}
```

## Exemplo de Resposta

```json
[
  {
    "event_id": "9014",
    "event_name": "FESTAS CARNAVIP - CARNAVAL DE OURO PRETO 2026",
    "total_revenue": 876.15,
    "total_expenses": 9.57,
    "total_liabilities": 785.00,
    "total_repaid": 100.00,
    "pending_balance": 685.00,
    "balance": 81.58,
    "transaction_count": 14,
    "first_transaction_date": "2026-01-30T19:13:06.881Z",
    "last_transaction_date": "2026-01-30T21:39:27.440Z"
  }
]
```

## Como Exibir no Frontend

### ⚠️ IMPORTANTE: Use `pending_balance` para "Valor a Repassar"

O campo **`pending_balance`** já está calculado corretamente pelo backend:
```
pending_balance = total_liabilities - total_repaid
```

**NÃO** calcule manualmente no frontend. Use diretamente o valor retornado em `pending_balance`.

### Campos e Seus Significados

| Campo | Significado | Como Usar |
|-------|-------------|-----------|
| `total_revenue` | Total de receitas (entradas) | Mostrar como receita total do evento |
| `total_expenses` | Total de despesas (taxas) | Mostrar como custos/despesas |
| `total_liabilities` | Total de obrigações (valor total a repassar) | **NÃO usar diretamente** - é o valor total antes dos repasses |
| `total_repaid` | Total já repassado | Mostrar como "Já repassado" ou "Pago" |
| `pending_balance` | **Saldo pendente a repassar** | **USAR ESTE** para mostrar "Valor a Repassar" ou "Pendente" |
| `balance` | Saldo líquido (lucro) | Mostrar como lucro/prejuízo do evento |

### Exemplo de Exibição

```typescript
// ✅ CORRETO - Usar pending_balance diretamente
const valorARepassar = event.pending_balance; // 685.00

// ❌ ERRADO - Não calcular manualmente
const valorARepassar = event.total_liabilities; // 785.00 (está errado!)
```

### Exemplo Visual

```
┌─────────────────────────────────────────┐
│ Evento: FESTAS CARNAVIP                 │
├─────────────────────────────────────────┤
│ Receita Total:      R$ 876,15           │
│ Despesas:           R$   9,57          │
│ ─────────────────────────────────────── │
│ Valor Total a Repassar: R$ 785,00       │
│ Já Repassado:        R$ 100,00          │
│ ─────────────────────────────────────── │
│ ⚠️ Pendente a Repassar: R$ 685,00       │ ← USAR pending_balance
│ ─────────────────────────────────────── │
│ Saldo Líquido:       R$  81,58          │
└─────────────────────────────────────────┘
```

## Comportamento Após Criar Saque Manual

Quando um saque manual é criado via `POST /producer_payout/manual`:

1. **Atualizar os dados imediatamente:**
   - Recarregar a lista de eventos chamando novamente `GET /financial_entry/events/financial-balance`
   - **NÃO** atualizar apenas no frontend sem recarregar do backend

2. **O que muda na resposta:**
   - `total_repaid` aumenta pelo valor do saque
   - `pending_balance` diminui pelo valor do saque
   - `total_liabilities` **NÃO muda** (é o valor total original)

### Exemplo de Mudança

**Antes do saque:**
```json
{
  "total_liabilities": 785.00,
  "total_repaid": 0.00,
  "pending_balance": 785.00
}
```

**Após saque de R$ 100,00:**
```json
{
  "total_liabilities": 785.00,  // Não muda
  "total_repaid": 100.00,       // Aumentou
  "pending_balance": 685.00     // Diminuiu
}
```

## Fluxo Recomendado no Frontend

### 1. Ao Carregar a Tela de Saldos

```typescript
async function loadEventBalances(accountId: string) {
  // Buscar lista detalhada de eventos
  const eventsResponse = await fetch(
    `/financial_entry/events/financial-balance?account_id=${accountId}`
  );
  const events = await eventsResponse.json();
  
  // Buscar totais consolidados (NOVO - use este para o dashboard!)
  const summaryResponse = await fetch(
    `/financial_entry/events/financial-balance/summary?account_id=${accountId}`
  );
  const summary = await summaryResponse.json();
  
  // Exibir totais no topo do dashboard
  displaySummary({
    totalARepassar: summary.total_pending_balance, // ✅ Use este
    jaRepassado: summary.total_repaid,
    lucroTotal: summary.total_balance,
    totalReceita: summary.total_revenue,
    totalDespesas: summary.total_expenses,
  });
  
  // Exibir lista de eventos
  events.forEach(event => {
    displayEvent({
      name: event.event_name,
      valorARepassar: event.pending_balance, // ✅ Usar este campo
      jaRepassado: event.total_repaid,
      totalObrigacao: event.total_liabilities,
    });
  });
}
```

### 2. Após Criar Saque Manual

```typescript
async function createManualPayout(data: CreatePayoutData) {
  // 1. Criar o saque
  await fetch('/producer_payout/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // 2. Recarregar os dados do backend
  await loadEventBalances(data.account_id); // ✅ Recarregar do backend
  // Isso recarrega tanto a lista de eventos quanto os totais consolidados
  
  // ❌ NÃO fazer isso:
  // updateLocalState(eventId, -100); // Não atualizar apenas no frontend
  // const newTotal = oldTotal - 100; // Não calcular totais no frontend
}
```

### 3. Exibição na Tabela

```typescript
// Componente de tabela
function EventBalanceTable({ events }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Evento</th>
          <th>Receita</th>
          <th>Despesas</th>
          <th>Total a Repassar</th>
          <th>Já Repassado</th>
          <th>Pendente</th> {/* ← pending_balance */}
          <th>Saldo Líquido</th>
        </tr>
      </thead>
      <tbody>
        {events.map(event => (
          <tr key={event.event_id}>
            <td>{event.event_name}</td>
            <td>R$ {formatCurrency(event.total_revenue)}</td>
            <td>R$ {formatCurrency(event.total_expenses)}</td>
            <td>R$ {formatCurrency(event.total_liabilities)}</td>
            <td>R$ {formatCurrency(event.total_repaid)}</td>
            <td className="warning">
              R$ {formatCurrency(event.pending_balance)} {/* ✅ USAR ESTE */}
            </td>
            <td>R$ {formatCurrency(event.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Validações no Frontend

### Antes de Criar Saque Manual

```typescript
function canCreatePayout(event: EventFinancialBalance, amount: number): boolean {
  // O valor não pode ser maior que o pendente
  if (amount > event.pending_balance) {
    showError(`O valor (R$ ${amount}) não pode ser maior que o pendente (R$ ${event.pending_balance})`);
    return false;
  }
  
  // O valor deve ser maior que zero
  if (amount <= 0) {
    showError('O valor deve ser maior que zero');
    return false;
  }
  
  return true;
}
```

## Resumo das Mudanças

### ✅ O que o Backend Faz

- Calcula `total_repaid` considerando:
  - Saques de solicitações (`PRODUCER_PAYOUT`)
  - Saques manuais (`MANUAL_PAYOUT`)
- Calcula `pending_balance = total_liabilities - total_repaid`
- Retorna tudo pronto para uso

### ✅ O que o Frontend Deve Fazer

1. **Usar `pending_balance` diretamente** para exibir "Valor a Repassar"
2. **Recarregar os dados** após criar um saque manual
3. **Não calcular manualmente** `pending_balance` no frontend
4. **Validar** que o valor do saque não seja maior que `pending_balance`

### ❌ O que o Frontend NÃO Deve Fazer

1. ❌ Calcular `pending_balance` manualmente
2. ❌ Usar `total_liabilities` como "Valor a Repassar"
3. ❌ Atualizar apenas o estado local sem recarregar do backend
4. ❌ Assumir que `total_repaid` é sempre 0

## Exemplo Completo de Integração

```typescript
// types.ts
interface EventFinancialBalance {
  event_id: string | null;
  event_name: string | null;
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number;
  pending_balance: number; // ← USAR ESTE para "Valor a Repassar"
  balance: number;
  transaction_count: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
}

interface EventFinancialBalanceSummary {
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number;
  total_pending_balance: number; // ← USAR ESTE para "Total a Repassar" no dashboard
  total_balance: number;
  event_count: number;
  total_transaction_count: number;
}

// api.ts
export async function getEventFinancialBalance(
  accountId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    eventId?: string;
    eventName?: string;
  }
): Promise<EventFinancialBalance[]> {
  const params = new URLSearchParams();
  params.append('account_id', accountId);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);
  if (filters?.eventId) params.append('event_id', filters.eventId);
  if (filters?.eventName) params.append('event_name', filters.eventName);

  const response = await fetch(
    `/financial_entry/events/financial-balance?${params}`
  );
  return response.json();
}

// NOVO - Endpoint de totais consolidados
export async function getEventFinancialBalanceSummary(
  accountId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    eventId?: string;
    eventName?: string;
  }
): Promise<EventFinancialBalanceSummary> {
  const params = new URLSearchParams();
  params.append('account_id', accountId);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);
  if (filters?.eventId) params.append('event_id', filters.eventId);
  if (filters?.eventName) params.append('event_name', filters.eventName);

  const response = await fetch(
    `/financial_entry/events/financial-balance/summary?${params}`
  );
  return response.json();
}

// component.tsx
function EventBalanceList() {
  const [events, setEvents] = useState<EventFinancialBalance[]>([]);
  const accountId = useAccountId();
  
  useEffect(() => {
    loadEvents();
  }, [accountId]);
  
  async function loadEvents() {
    const data = await getEventFinancialBalance(accountId);
    setEvents(data);
  }
  
  async function handleCreatePayout(eventId: string, amount: number) {
    const event = events.find(e => e.event_id === eventId);
    
    // Validar
    if (amount > event.pending_balance) {
      alert(`Valor maior que o pendente (R$ ${event.pending_balance})`);
      return;
    }
    
    // Criar saque
    await createManualPayout({
      account_code: 'oticket-grupo',
      event_id: eventId,
      amount,
    });
    
    // Recarregar dados
    await loadEvents(); // ✅ Recarregar do backend
  }
  
  return (
    <div>
      {events.map(event => (
        <div key={event.event_id}>
          <h3>{event.event_name}</h3>
          <p>Receita: R$ {event.total_revenue}</p>
          <p>Despesas: R$ {event.total_expenses}</p>
          <p>Total a Repassar: R$ {event.total_liabilities}</p>
          <p>Já Repassado: R$ {event.total_repaid}</p>
          <p className="highlight">
            ⚠️ Pendente: R$ {event.pending_balance} {/* ✅ USAR ESTE */}
          </p>
          <p>Saldo Líquido: R$ {event.balance}</p>
          
          <button
            onClick={() => handleCreatePayout(event.event_id, 100)}
            disabled={event.pending_balance <= 0}
          >
            Criar Saque Manual
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Checklist de Implementação

- [ ] **Usar endpoint `/summary` para totais consolidados** (não calcular no frontend)
- [ ] Usar `pending_balance` para exibir "Valor a Repassar" de cada evento
- [ ] Usar `total_pending_balance` para exibir "Total a Repassar" no dashboard
- [ ] Exibir `total_repaid` como "Já Repassado"
- [ ] Recarregar dados após criar saque manual (tanto lista quanto totais)
- [ ] Validar que valor do saque ≤ `pending_balance`
- [ ] Não calcular `pending_balance` manualmente no frontend
- [ ] Não usar `total_liabilities` como "Valor a Repassar"
- [ ] Não calcular totais no frontend (use o endpoint `/summary`)
- [ ] Atualizar a UI imediatamente após recarregar os dados

## Suporte

Se houver dúvidas sobre a implementação, verifique:
1. O endpoint está retornando `pending_balance` corretamente?
2. O frontend está usando `pending_balance` e não `total_liabilities`?
3. Os dados estão sendo recarregados após criar o saque?
