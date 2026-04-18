# API de Repasses a Produtores

Esta documentação descreve os endpoints para gerenciar repasses a produtores no ERP.

## Endpoints

### 1. Listar Solicitações de Pagamento

Busca as solicitações de pagamento aprovadas da API externa.

**Endpoint:** `GET /producer_payout/requests`

**Query Parameters:**
- `account_code` (string, opcional): Código da conta
- `event_id` (string, opcional): ID do evento para filtrar
- `status` (string, opcional): Status das solicitações (padrão: `waiting_payment`)
- `limit` (number, opcional): Limite de resultados (padrão: 10)
- `offset` (number, opcional): Offset para paginação (padrão: 0)

**Exemplo de Requisição:**
```http
GET /producer_payout/requests?account_code=ACC001&status=waiting_payment&limit=10&offset=0
```

**Exemplo de Resposta:**
```json
[
  {
    "id": 7870,
    "payment_key": "30829177000166",
    "payment_receiver": "RA BORGES COMÉRCIO E SERVIÇOS LTDA",
    "value": 10127.19,
    "event_id": 8630,
    "event": {
      "id": 8630,
      "name": "Rio das Pedras | Outubro",
      "date": "2025-10-01T00:00:00Z"
    },
    "approved": true,
    "payed": false,
    "payment_date": "2026-01-30T00:00:00Z",
    "created_at": "2026-01-29T14:31:19.210085Z",
    "bank": 748,
    "description": "GRUPO RGR",
    "user": {
      "id": 414039,
      "first_name": "Wellignton Alves",
      "last_name": "Moreira"
    },
    "requested_by": 414039
  }
]
```

**Campos da Resposta:**
- `id`: ID da solicitação
- `payment_key`: Chave de pagamento (CPF/CNPJ)
- `payment_receiver`: Nome do recebedor
- `value`: Valor a ser repassado
- `event_id`: ID do evento
- `event`: Objeto com informações do evento
- `approved`: Se a solicitação foi aprovada
- `payed`: Se o pagamento já foi realizado
- `payment_date`: Data prevista para pagamento
- `created_at`: Data de criação da solicitação
- `bank`: Código do banco
- `description`: Descrição da solicitação
- `user`: Informações do usuário que solicitou
- `requested_by`: ID do usuário que solicitou

---

### 2. Marcar Solicitação como Paga

Marca uma solicitação de pagamento como paga e cria o lançamento contábil correspondente.

**Endpoint:** `PUT /producer_payout/requests/:id/mark-as-paid`

**Parâmetros de URL:**
- `id` (number): ID da solicitação

**Body:**
```json
{
  "account_code": "ACC001"
}
```

**Exemplo de Requisição:**
```http
PUT /producer_payout/requests/7870/mark-as-paid
Content-Type: application/json

{
  "account_code": "ACC001"
}
```

**Exemplo de Resposta:**
```json
{
  "message": "Repasse marcado como pago com sucesso"
}
```

**Comportamento:**
1. Busca a solicitação na API externa
2. Verifica se já foi marcada como paga (retorna erro se sim)
3. Tenta atualizar o campo `payed` na API externa (se o endpoint existir)
4. Cria um lançamento contábil (LIABILITY DEBIT) para descontar da obrigação
5. O lançamento é criado com:
   - `reference_id`: ID da solicitação
   - `reference_type`: `PRODUCER_PAYOUT`
   - `chart_of_account.code`: `2.1.1` (Repasse a Produtor)
   - `type`: `DEBIT` (reduz a obrigação)
   - `amount`: Valor da solicitação
   - `description`: "Repasse pago - {payment_receiver} - Evento: {event_name}"

**Erros Possíveis:**
- `400 Bad Request`: Solicitação não encontrada
- `400 Bad Request`: Solicitação já foi marcada como paga
- `400 Bad Request`: Conta contábil Repasse a Produtor (2.1.1) não encontrada
- `400 Bad Request`: Conta não encontrada com código: {code}

---

## Integração com Saldo Financeiro

Quando uma solicitação é marcada como paga, o lançamento contábil é criado automaticamente. Isso afeta o cálculo do saldo financeiro do evento:

- **total_liabilities**: Total de obrigações (a pagar ao produtor)
- **total_repaid**: Total já repassado (pagos)
- **pending_balance**: Saldo pendente a repassar (`total_liabilities - total_repaid`)

Esses valores são retornados no endpoint `GET /financial_entry/events/financial-balance`.

---

## Fluxo Completo

1. **Frontend busca solicitações:**
   ```http
   GET /producer_payout/requests?account_code=ACC001&status=waiting_payment
   ```

2. **Frontend exibe lista** com botão "Marcar como pago" para cada solicitação

3. **Usuário clica em "Marcar como pago":**
   ```http
   PUT /producer_payout/requests/7870/mark-as-paid
   {
     "account_code": "ACC001"
   }
   ```

4. **Sistema:**
   - Atualiza `payed: true` na API externa (se possível)
   - Cria lançamento contábil para descontar da obrigação
   - Retorna sucesso

5. **Frontend atualiza a lista** e o saldo financeiro do evento

---

## Notas Importantes

- A API externa é configurada via variável de ambiente `EXTERNAL_API_URL` (padrão: `https://admin-dev-api.oticket.com.br`)
- Se o endpoint de atualização na API externa não existir, o sistema apenas loga um aviso e continua criando o lançamento contábil
- O lançamento contábil sempre é criado, mesmo se a atualização na API externa falhar
- O campo `payed` na resposta indica se o pagamento já foi realizado
- O `reference_id` do lançamento contábil corresponde ao `id` da solicitação na API externa
