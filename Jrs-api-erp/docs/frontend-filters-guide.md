# Guia de Filtros - Saldo de Eventos

Este documento explica como usar os filtros disponíveis nas rotas de saldo de eventos.

## Filtros Disponíveis

### 1. `account_id` (UUID, opcional)
Filtra por conta específica. Se a conta for MASTER, retorna dados de todas as contas.

**Exemplo:**
```typescript
GET /financial_entry/events/financial-balance?account_id=5127ca53-20f9-46ba-9ece-d0a9fb94d7eb
```

### 2. `start_date` (ISO date string, opcional)
Data inicial do período. Se fornecer apenas data (sem hora), ajusta automaticamente para início do dia (00:00:00).

**Exemplo:**
```typescript
GET /financial_entry/events/financial-balance?account_id=xxx&start_date=2026-01-01
// ou com hora
GET /financial_entry/events/financial-balance?account_id=xxx&start_date=2026-01-01T00:00:00.000Z
```

### 3. `end_date` (ISO date string, opcional)
Data final do período. Se fornecer apenas data (sem hora), ajusta automaticamente para final do dia (23:59:59).

**Exemplo:**
```typescript
GET /financial_entry/events/financial-balance?account_id=xxx&end_date=2026-01-31
// ou com hora
GET /financial_entry/events/financial-balance?account_id=xxx&end_date=2026-01-31T23:59:59.999Z
```

### 4. `event_id` (string, opcional) ⭐ NOVO
Filtra por ID do evento usando busca exata. Retorna apenas o evento com o ID especificado.

**Exemplo:**
```typescript
GET /financial_entry/events/financial-balance?account_id=xxx&event_id=123
```

**Uso no Frontend:**
```typescript
// Buscar saldo de um evento específico
const eventBalance = await fetch(
  `/financial_entry/events/financial-balance?account_id=${accountId}&event_id=${eventId}`
).then(r => r.json());


```

### 5. `event_name` (string, opcional) ⭐ NOVO
Filtra por nome do evento usando busca parcial (case-insensitive). Retorna todos os eventos cujo nome contém o texto fornecido.

**Exemplo:**
```typescript
GET /financial_entry/events/financial-balance?account_id=xxx&event_name=Rock
```

**Retorna eventos como:**
- "Rock Show"
- "Rock Festival"
- "Rock Concert"
- "Hard Rock Cafe"

**Uso no Frontend:**
```typescript
// Buscar eventos por nome
const events = await fetch(
  `/financial_entry/events/financial-balance?account_id=${accountId}&event_name=${searchTerm}`
).then(r => r.json());


```

## Combinando Filtros

Você pode combinar múltiplos filtros para refinar a busca:

```typescript
// Buscar eventos com "Rock" no nome, em janeiro de 2026
GET /financial_entry/events/financial-balance?account_id=xxx&event_name=Rock&start_date=2026-01-01&end_date=2026-01-31

// Buscar um evento específico em um período
GET /financial_entry/events/financial-balance?account_id=xxx&event_id=123&start_date=2026-01-01&end_date=2026-01-31
```

## Exemplo Completo de Implementação

### Componente React com Filtros

```typescript
import { useState, useEffect } from 'react';

interface Filters {
  accountId: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  eventName?: string;
}

function EventBalanceFilters() {
  const [filters, setFilters] = useState<Filters>({
    accountId: 'xxx',
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('account_id', filters.accountId);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.eventId) params.append('event_id', filters.eventId);
      if (filters.eventName) params.append('event_name', filters.eventName);

      const response = await fetch(
        `/financial_entry/events/financial-balance?${params}`
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div className="filters">
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Data inicial"
        />
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Data final"
        />
        <input
          type="text"
          value={filters.eventId || ''}
          onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}
          placeholder="ID do Evento"
        />
        <input
          type="text"
          value={filters.eventName || ''}
          onChange={(e) => setFilters({ ...filters, eventName: e.target.value })}
          placeholder="Nome do Evento"
        />
        <button onClick={loadEvents}>Filtrar</button>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Pendente a Repassar</th>
              <th>Já Repassado</th>
              <th>Saldo Líquido</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id}>
                <td>{event.event_name}</td>
                <td>R$ {event.pending_balance.toFixed(2)}</td>
                <td>R$ {event.total_repaid.toFixed(2)}</td>
                <td>R$ {event.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Hook Customizado para Filtros

```typescript
import { useState, useEffect } from 'react';

interface UseEventBalanceFilters {
  accountId: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  eventName?: string;
}

export function useEventBalance(filters: UseEventBalanceFilters) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters.accountId, filters.startDate, filters.endDate, filters.eventId, filters.eventName]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('account_id', filters.accountId);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.eventId) params.append('event_id', filters.eventId);
      if (filters.eventName) params.append('event_name', filters.eventName);

      // Carregar lista de eventos
      const eventsResponse = await fetch(
        `/financial_entry/events/financial-balance?${params}`
      );
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Carregar totais consolidados
      const summaryResponse = await fetch(
        `/financial_entry/events/financial-balance/summary?${params}`
      );
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    events,
    summary,
    loading,
    error,
    reload: loadData,
  };
}

// Uso do hook
function EventBalanceScreen() {
  const [filters, setFilters] = useState({
    accountId: 'xxx',
    eventName: '',
  });

  const { events, summary, loading, error } = useEventBalance(filters);

  return (
    <div>
      <input
        type="text"
        value={filters.eventName}
        onChange={(e) => setFilters({ ...filters, eventName: e.target.value })}
        placeholder="Buscar por nome do evento..."
      />
      
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      
      {summary && (
        <div>
          <h2>Totais</h2>
          <p>Pendente a Repassar: R$ {summary.total_pending_balance.toFixed(2)}</p>
        </div>
      )}
      
      <ul>
        {events.map((event) => (
          <li key={event.event_id}>
            {event.event_name} - R$ {event.pending_balance.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Casos de Uso Comuns

### 1. Buscar Evento Específico
```typescript
// Quando o usuário clica em um evento na lista
function handleEventClick(eventId: string) {
  const eventBalance = await fetch(
    `/financial_entry/events/financial-balance?account_id=${accountId}&event_id=${eventId}`
  ).then(r => r.json());
  
  // Mostrar detalhes do evento
  showEventDetails(eventBalance[0]);
}
```

### 2. Busca por Nome (Autocomplete)
```typescript
// Quando o usuário digita no campo de busca
function handleSearchInput(searchTerm: string) {
  if (searchTerm.length >= 3) {
    const events = await fetch(
      `/financial_entry/events/financial-balance?account_id=${accountId}&event_name=${searchTerm}`
    ).then(r => r.json());
    
    // Mostrar sugestões
    showSuggestions(events);
  }
}
```

### 3. Filtrar por Período e Evento
```typescript
// Relatório mensal de um evento específico
function generateMonthlyReport(eventId: string, month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const eventBalance = await fetch(
    `/financial_entry/events/financial-balance?account_id=${accountId}&event_id=${eventId}&start_date=${startDate}&end_date=${endDate}`
  ).then(r => r.json());
  
  return eventBalance[0];
}
```

## Observações Importantes

1. **`event_id` é busca exata**: Retorna apenas o evento com o ID exato fornecido
2. **`event_name` é busca parcial**: Retorna todos os eventos que contêm o texto (case-insensitive)
3. **Filtros são opcionais**: Se não fornecer nenhum filtro, retorna todos os eventos
4. **Filtros podem ser combinados**: Use múltiplos filtros para refinar a busca
5. **Mesmos filtros em todas as rotas**: Os filtros funcionam em:
   - `GET /financial_entry/events/financial-balance`
   - `GET /financial_entry/events/financial-balance/summary`
   - `GET /financial_entry/events/balances`

## Performance

- Use `event_id` quando souber o ID exato (mais rápido)
- Use `event_name` para buscas por texto (pode ser mais lento com muitos eventos)
- Combine com `start_date` e `end_date` para limitar o escopo da busca
- Considere implementar debounce no campo de busca por nome
