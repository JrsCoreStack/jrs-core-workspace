# OTicket ERP — Cockpit API (Contrato)

Este documento descreve o contrato dos endpoints adicionados no `oticket-api-erp` para **Cockpit** (Rituais, Reuniões/Ata, Planos de Ação, KPIs e Exceções do Calendário).

- **Base URL (exemplo)**: `http://localhost:3000`
- **Prefixo**: (sem prefixo global) — rotas começam em `/cockpit/...`
- **Formato**: JSON
- **Auth**: **não documentado aqui** (não foi integrado ao front ainda). Se o projeto exigir guard JWT/roles, aplicar depois.

---

## Convenções

- **IDs**: `uuid` (string)
- **Datas**:
  - `YYYY-MM-DD` para campos `date` (ex.: `due_date`, `occurrence_date`)
  - `timestamptz` para `occurred_at` (retorna como ISO string)
- **Erros**:
  - `400 Bad Request` com mensagem `"Dados inválidos: ..."` quando DTO falha
  - `404 Not Found` com mensagem `"… não encontrado."`

---

## 1) Rituais

### `GET /cockpit/rituals`
Lista rituais (com filtros opcionais).

**Query params (opcionais)**:
- `q`: string (busca em `name` e `owner_name`)
- `area`: string (ex.: `COMERCIAL`, `MARKETING`, `ALL`)
- `freq`: string (ex.: `DAILY`, `SEMANAL`, `MENSAL`, ou `all`)
- `status`: `active | inactive | all`

**Response 200**: `CockpitRitual[]`

Exemplo:
```json
[
  {
    "id": "c2c0d1c0-7c5a-4e2f-9c4a-2e6b2b59c3a1",
    "name": "Daily Comercial",
    "area": "COMERCIAL",
    "freq": "DAILY",
    "owner_name": "Evandro",
    "schedule": "Seg–Sex · 09:00",
    "duration_min": 30,
    "kpi_count": 3,
    "tracked_sessions": 22,
    "total_sessions": 24,
    "tracking_label": "sessões rastreadas",
    "next_label": "Hoje 09:00",
    "participants": [{"name":"Evandro","initials":"EV","color":"#16a34a"}],
    "extra_participants": 4,
    "is_active": true,
    "last_not_tracked_date": null,
    "created_at": "2026-03-31T12:00:00.000Z",
    "updated_at": "2026-03-31T12:00:00.000Z"
  }
]
```

### `POST /cockpit/rituals`
Cria ritual.

**Body** (principais):
- `name` (string) **obrigatório**
- `area` (string) **obrigatório**
- `freq` (string) **obrigatório**
- `owner_name` (string) **obrigatório**
- `schedule` (string) **obrigatório**
- opcionais: `duration_min`, `kpi_count`, `tracked_sessions`, `total_sessions`, `tracking_label`, `next_label`, `participants`, `extra_participants`, `is_active`, `last_not_tracked_date`

**Response 201**: `CockpitRitual`

### `GET /cockpit/rituals/:id`
Busca ritual por id.

**Response 200**: `CockpitRitual`

### `PUT /cockpit/rituals/:id`
Atualiza ritual (parcial via DTO opcional).

**Response 200**: `CockpitRitual`

### `POST /cockpit/rituals/:id/duplicate`
Duplica ritual (cria novo com sufixo `"(cópia)"` e `is_active=true`).

**Response 201**: `CockpitRitual`

### `PATCH /cockpit/rituals/:id/archive`
Arquiva (seta `is_active=false`).

**Response 200**: `CockpitRitual`

### `PATCH /cockpit/rituals/:id/reactivate`
Reativa (seta `is_active=true`).

**Response 200**: `CockpitRitual`

---

## 2) Reuniões (Ata)

### `GET /cockpit/meetings`
Lista reuniões.

**Query params (opcional)**:
- `ritualId`: `uuid` (filtra por ritual)

**Response 200**: `CockpitMeeting[]`

### `POST /cockpit/meetings`
Cria reunião (inicia registro).

**Body (opcional)**:
- `ritual_id?: uuid | null`
- `duration_min?: number`
- `state?: string` (default `"done"`)

**Response 201**: `CockpitMeeting`

### `GET /cockpit/meetings/:id`
Busca reunião por id.

**Response 200**: `CockpitMeeting`

### `POST /cockpit/meetings/:id/ata`
Anexa o JSON da **ata** na reunião (`ata` em `jsonb`) e seta `state='done'`.

**Body**: `any` (JSON livre — o front gera o formato da ata)

**Response 201/200**: `CockpitMeeting`

Exemplo (resumido):
```json
{
  "transcription": "00:00 Evandro: ...",
  "topics": ["Pipeline", "Conversão"],
  "decisions": ["Repriorizar canais"],
  "actions": [{"title":"Ajustar campanha","owner":"Marketing","dueDate":"2026-04-05"}],
  "kpis": [{"name":"CAC","metric":"CAC (R$)","goal":120,"unit":"R$"}]
}
```

---

## 3) Planos de Ação

### `GET /cockpit/action-plans`
Lista planos de ação.

**Query params (opcionais)**:
- `q`: busca em `title` e `owner_name`
- `area`: string (`all` para ignorar)
- `status`: string (`all` para ignorar)
- `priority`: string (`all` para ignorar)
- `due`: `any | today | overdue`
- `today`: `YYYY-MM-DD` (**necessário** quando `due=today|overdue`)

**Response 200**: `CockpitActionPlan[]`

### `POST /cockpit/action-plans`
Cria plano de ação.

**Body**:
- `title` (string) **obrigatório**
- `status` (string) **obrigatório**
- `area` (string) **obrigatório**
- `owner_name` (string) **obrigatório**
- `due_date` (YYYY-MM-DD) **obrigatório**
- opcionais: `description`, `priority`, `ritual_id`, `meeting_id`

**Response 201**: `CockpitActionPlan`

### `GET /cockpit/action-plans/:id`
**Response 200**: `CockpitActionPlan`

### `PUT /cockpit/action-plans/:id`
**Response 200**: `CockpitActionPlan`

### `DELETE /cockpit/action-plans/:id`
**Response 200**:
```json
{ "message": "Plano de ação deletado com sucesso" }
```

---

## 4) KPIs

### `GET /cockpit/kpis`
Lista KPIs.

**Query params (opcionais)**:
- `q`: busca em `name` e `metric`
- `area`: string (`ALL` para ignorar)
- `ritual_id`: uuid
- `meeting_id`: uuid

**Response 200**: `CockpitKpi[]`

### `POST /cockpit/kpis`
Cria KPI.

**Body**:
- `name` (string) **obrigatório**
- `metric` (string) **obrigatório**
- `goal` (string/number serializado) **obrigatório**
- `area` (string) **obrigatório**
- opcionais: `unit`, `ritual_id`, `meeting_id`

**Response 201**: `CockpitKpi`

### `GET /cockpit/kpis/:id`
**Response 200**: `CockpitKpi`

### `PUT /cockpit/kpis/:id`
**Response 200**: `CockpitKpi`

### `DELETE /cockpit/kpis/:id`
**Response 200**:
```json
{ "message": "KPI deletado com sucesso" }
```

---

## 5) Calendário — Exceções

### `GET /cockpit/calendar/exceptions`
Lista exceções.

**Query params (opcionais)**:
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`
- `ritual_id`: uuid

**Response 200**: `CockpitCalendarException[]`

### `POST /cockpit/calendar/exceptions`
Cria exceção.

**Body**:
- `ritual_id?: uuid | null`
- `occurrence_date` (YYYY-MM-DD) **obrigatório**
- `exception_type` (string) **obrigatório**
- `notes?: string | null`

**Response 201**: `CockpitCalendarException`

### `GET /cockpit/calendar/exceptions/:id`
**Response 200**: `CockpitCalendarException`

---

## Modelos (shape)

### `CockpitRitual`
Campos relevantes:
- `id`, `name`, `area`, `freq`, `owner_name`, `schedule`, `duration_min`
- `kpi_count`, `tracked_sessions`, `total_sessions`, `tracking_label`
- `next_label`, `participants[]`, `extra_participants`
- `is_active`, `last_not_tracked_date`
- `created_at`, `updated_at`

### `CockpitMeeting`
- `id`, `ritual_id`, `occurred_at`, `duration_min`, `state`, `ata`
- `created_at`, `updated_at`

### `CockpitActionPlan`
- `id`, `title`, `description`, `status`, `area`, `owner_name`
- `due_date`, `priority`, `ritual_id`, `meeting_id`, `history`
- `is_active`, `created_at`, `updated_at`

### `CockpitKpi`
- `id`, `name`, `metric`, `goal`, `unit`, `area`
- `ritual_id`, `meeting_id`, `is_active`, `created_at`, `updated_at`

### `CockpitCalendarException`
- `id`, `ritual_id`, `occurrence_date`, `exception_type`, `notes`
- `created_at`, `updated_at`

---

## Notas de Banco / Migration

- A migration Cockpit foi adicionada em: `src/migrations/1760000000000-cockpit.ts`
- Para aplicar no ambiente: usar o fluxo de migrations do projeto (`npm run migration:run`).

