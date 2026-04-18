# API de Totais Consolidados de Eventos

Esta documentação descreve o endpoint que retorna os totais consolidados de todos os eventos, útil para dashboards e relatórios gerais.

## Endpoint

**GET** `/financial_entry/events/financial-balance/summary`

Retorna os totais consolidados (soma de todos os eventos) sem precisar calcular no frontend.

---

## Parâmetros de Query (todos opcionais)

- `account_id` (UUID): Filtrar por conta específica
  - Se a conta for MASTER, retorna totais de todas as contas
- `start_date` (ISO date string): Data inicial do período
  - Se fornecer apenas data (sem hora), ajusta automaticamente para início do dia (00:00:00)
- `end_date` (ISO date string): Data final do período
  - Se fornecer apenas data (sem hora), ajusta automaticamente para final do dia (23:59:59)
- `event_id` (string): Filtrar por ID do evento (busca exata)
  - Exemplo: `event_id=123` retorna totais apenas do evento com ID "123"
- `event_name` (string): Filtrar por nome do evento (busca parcial, case-insensitive)
  - Exemplo: `event_name=Rock` retorna totais de eventos com "Rock Show", "Rock Festival", etc.

---

## Exemplos de Uso

### Exemplo 1: Totais de uma conta
```http
GET /financial_entry/events/financial-balance/summary?account_id=5127ca53-20f9-46ba-9ece-d0a9fb94d7eb
```

### Exemplo 2: Totais em um período específico
```http
GET /financial_entry/events/financial-balance/summary?account_id=xxx&start_date=2026-01-01&end_date=2026-01-31
```

### Exemplo 3: Todos os totais (se for conta MASTER)
```http
GET /financial_entry/events/financial-balance/summary
```

### Exemplo 4: Totais de um evento específico (por ID)
```http
GET /financial_entry/events/financial-balance/summary?account_id=xxx&event_id=123
```

### Exemplo 5: Totais de eventos filtrados por nome
```http
GET /financial_entry/events/financial-balance/summary?account_id=xxx&event_name=Rock
```

---

## Formato da Resposta

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

---

## Campos da Resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total_revenue` | number | Soma de todas as receitas de todos os eventos |
| `total_expenses` | number | Soma de todas as despesas de todos os eventos |
| `total_liabilities` | number | Soma de todas as obrigações (valor total a repassar) |
| `total_repaid` | number | Soma de todos os repasses já realizados |
| `total_pending_balance` | number | **Soma do saldo pendente a repassar** (total_liabilities - total_repaid) |
| `total_balance` | number | Soma do saldo líquido de todos os eventos |
| `event_count` | number | Quantidade de eventos considerados |
| `total_transaction_count` | number | Soma total de transações de todos os eventos |

---

## Interpretação dos Valores

### Para Dashboard/Relatórios

**`total_pending_balance`** = **Total pendente a repassar aos produtores**
- Este é o valor total que ainda falta repassar
- Já considera todos os repasses já realizados (solicitações + saques manuais)
- **Use este campo para exibir "Total a Repassar" no dashboard**

**`total_repaid`** = **Total já repassado**
- Soma de todos os repasses já realizados
- Inclui solicitações aprovadas e saques manuais

**`total_balance`** = **Lucro total da empresa**
- Soma do lucro líquido de todos os eventos
- Representa o lucro total após pagar despesas e obrigações

---

## Exemplo de Uso no Frontend

### ✅ CORRETO - Buscar totais da API

```typescript
// Buscar totais consolidados
const summary = await fetch(
  `/financial_entry/events/financial-balance/summary?account_id=${accountId}`
).then(r => r.json());


```

### ❌ ERRADO - Calcular no frontend

```typescript
// ❌ NÃO fazer isso
const events = await fetch('/financial_entry/events/financial-balance').then(r => r.json());
const totals = events.reduce((acc, event) => ({
  pending_balance: acc.pending_balance + event.pending_balance,
  // ...
}), { pending_balance: 0 });
```

---

## Exemplo Completo de Integração

```typescript
// types.ts
interface EventFinancialBalanceSummary {
  total_revenue: number;
  total_expenses: number;
  total_liabilities: number;
  total_repaid: number;
  total_pending_balance: number;  // ⚠️ USE ESTE para "Total a Repassar"
  total_balance: number;
  event_count: number;
  total_transaction_count: number;
}

// api.ts
export async function getEventFinancialBalanceSummary(
  accountId: string,
  startDate?: string,
  endDate?: string,
  eventId?: string,
  eventName?: string
): Promise<EventFinancialBalanceSummary> {
  const params = new URLSearchParams();
  params.append('account_id', accountId);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (eventId) params.append('event_id', eventId);
  if (eventName) params.append('event_name', eventName);

  const response = await fetch(
    `/financial_entry/events/financial-balance/summary?${params}`
  );
  return response.json();
}

// component.tsx
function EventBalanceDashboard() {
  const [summary, setSummary] = useState<EventFinancialBalanceSummary | null>(null);
  const accountId = useAccountId();

  useEffect(() => {
    loadSummary();
  }, [accountId]);

  async function loadSummary() {
    const data = await getEventFinancialBalanceSummary(accountId);
    setSummary(data);
  }

  if (!summary) return <Loading />;

  return (
    <div className="dashboard">
      <div className="card">
        <h3>Receita Total</h3>
        <p>R$ {formatCurrency(summary.total_revenue)}</p>
      </div>

      <div className="card">
        <h3>Despesas Total</h3>
        <p>R$ {formatCurrency(summary.total_expenses)}</p>
      </div>

      <div className="card">
        <h3>Total a Repassar</h3>
        <p>R$ {formatCurrency(summary.total_liabilities)}</p>
      </div>

      <div className="card">
        <h3>Já Repassado</h3>
        <p>R$ {formatCurrency(summary.total_repaid)}</p>
      </div>

      <div className="card highlight">
        <h3>⚠️ Pendente a Repassar</h3>
        <p>R$ {formatCurrency(summary.total_pending_balance)}</p>
        {/* ✅ Use total_pending_balance diretamente */}
      </div>

      <div className="card">
        <h3>Lucro Total</h3>
        <p>R$ {formatCurrency(summary.total_balance)}</p>
      </div>

      <div className="card">
        <h3>Eventos</h3>
        <p>{summary.event_count} eventos</p>
        <p>{summary.total_transaction_count} transações</p>
      </div>
    </div>
  );
}
```

---

## Vantagens de Usar Este Endpoint

1. **Performance**: Cálculo feito no backend (mais rápido)
2. **Consistência**: Mesma lógica de cálculo garantida
3. **Menos processamento no frontend**: Frontend apenas exibe os dados
4. **Facilita cache**: Pode cachear os totais no backend
5. **Menos código no frontend**: Não precisa fazer reduce/soma manual

---

## Relação com Outros Endpoints

- **`GET /financial_entry/events/financial-balance`**: Retorna lista detalhada de cada evento
- **`GET /financial_entry/events/financial-balance/summary`**: Retorna totais consolidados (soma de todos)

**Recomendação**: Use ambos os endpoints:
- `summary` para exibir totais no topo do dashboard
- `financial-balance` para exibir a lista detalhada de eventos

---

## Observações Importantes

1. **Use `total_pending_balance` para "Total a Repassar"**: Este campo já está calculado corretamente
2. **Filtros**: Os mesmos filtros de `account_id`, `start_date` e `end_date` se aplicam
3. **Conta MASTER**: Se for conta MASTER, retorna totais de todas as contas
4. **Atualização**: Após criar saque manual, recarregue este endpoint para ver os totais atualizados
