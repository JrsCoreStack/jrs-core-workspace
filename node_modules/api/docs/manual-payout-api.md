# API de Saque Manual

Esta documentação descreve o endpoint para criar saques manuais de repasses a produtores no ERP.

## Endpoint

### Criar Saque Manual

Cria um saque manual para um evento, validando que o valor não seja maior que o saldo pendente do evento.

**Endpoint:** `POST /producer_payout/manual`

**Body:**
```json
{
  "account_code": "ACC001",
  "event_id": "8630",
  "amount": 5000.00,
  "description": "Repasse manual após término do evento",
  "payment_receiver": "RA BORGES COMÉRCIO E SERVIÇOS LTDA",
  "payment_key": "30829177000166"
}
```

**Campos:**
- `account_code` (string, obrigatório): Código da conta
- `event_id` (string, obrigatório): ID do evento
- `amount` (number, obrigatório): Valor do saque (deve ser maior que 0.01 e não pode ser maior que o saldo pendente do evento)
- `description` (string, opcional): Descrição do saque
- `payment_receiver` (string, opcional): Nome do recebedor
- `payment_key` (string, opcional): Chave de pagamento (CPF/CNPJ)

**Exemplo de Requisição:**
```http
POST /producer_payout/manual
Content-Type: application/json

{
  "account_code": "ACC001",
  "event_id": "8630",
  "amount": 5000.00,
  "description": "Repasse manual após término do evento",
  "payment_receiver": "RA BORGES COMÉRCIO E SERVIÇOS LTDA",
  "payment_key": "30829177000166"
}
```

**Exemplo de Resposta (Sucesso):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "account_id": "e939de41-e7be-4a97-b8ee-341d5776b5a3",
  "event_id": "8630",
  "event_name": "Rio das Pedras | Outubro",
  "amount": 5000.00,
  "description": "Repasse manual após término do evento",
  "financial_entry_id": "660e8400-e29b-41d4-a716-446655440000",
  "payment_receiver": "RA BORGES COMÉRCIO E SERVIÇOS LTDA",
  "payment_key": "30829177000166",
  "created_at": "2026-01-30T15:00:00.000Z",
  "updated_at": "2026-01-30T15:00:00.000Z"
}
```

**Erros Possíveis:**

1. **400 Bad Request - Evento não encontrado:**
```json
{
  "statusCode": 400,
  "message": "Evento 8630 não encontrado ou sem transações"
}
```

2. **400 Bad Request - Valor maior que saldo pendente:**
```json
{
  "statusCode": 400,
  "message": "O valor do saque (R$ 10000.00) não pode ser maior que o saldo pendente do evento (R$ 5000.00)"
}
```

3. **400 Bad Request - Conta contábil não encontrada:**
```json
{
  "statusCode": 400,
  "message": "Conta contábil Repasse a Produtor (2.1.1) não encontrada"
}
```

4. **400 Bad Request - Conta não encontrada:**
```json
{
  "statusCode": 400,
  "message": "Conta não encontrada com código: ACC001"
}
```

## Comportamento

1. **Validação do Saldo:**
   - O sistema busca o saldo pendente do evento através do endpoint `GET /financial_entry/events/financial-balance`
   - Valida que o valor do saque não seja maior que o `pending_balance` do evento
   - Se o valor for maior, retorna erro 400

2. **Criação do Lançamento Contábil:**
   - Cria um lançamento contábil (LIABILITY DEBIT) para descontar da obrigação
   - O lançamento é criado com:
     - `reference_type`: `MANUAL_PAYOUT`
     - `chart_of_account.code`: `2.1.1` (Repasse a Produtor)
     - `type`: `DEBIT` (reduz a obrigação)
     - `amount`: Valor do saque
     - `description`: Descrição fornecida ou gerada automaticamente
     - `event_id` e `event_name`: Informações do evento

3. **Registro do Saque:**
   - Cria um registro na tabela `erp_manual_payouts`
   - Vincula o registro ao lançamento contábil criado
   - Armazena informações adicionais (payment_receiver, payment_key, etc.)

## Integração com Saldo Financeiro

Quando um saque manual é criado, ele é automaticamente incluído no cálculo do saldo financeiro do evento:

- **total_repaid**: Inclui tanto saques de solicitações (`PRODUCER_PAYOUT`) quanto saques manuais (`MANUAL_PAYOUT`)
- **pending_balance**: É recalculado automaticamente (`total_liabilities - total_repaid`)

## Fluxo Completo

1. **Frontend busca saldo do evento:**
   ```http
   GET /financial_entry/events/financial-balance?account_id=xxx&event_id=8630
   ```

2. **Frontend exibe saldo pendente** e permite criar saque manual

3. **Usuário preenche formulário** com:
   - Valor (validado no frontend para não ser maior que `pending_balance`)
   - Descrição (opcional)
   - Dados do recebedor (opcional)

4. **Frontend envia requisição:**
   ```http
   POST /producer_payout/manual
   {
     "account_code": "ACC001",
     "event_id": "8630",
     "amount": 5000.00,
     "description": "Repasse manual após término do evento"
   }
   ```

5. **Sistema:**
   - Valida saldo
   - Cria lançamento contábil
   - Cria registro de saque manual
   - Retorna sucesso

6. **Frontend atualiza** o saldo do evento

## Notas Importantes

- O valor do saque **não pode ser maior** que o saldo pendente do evento
- O saque manual cria um lançamento contábil automaticamente
- O `reference_type` do lançamento é `MANUAL_PAYOUT` (diferente de `PRODUCER_PAYOUT` que vem de solicitações)
- O campo `financial_entry_id` vincula o registro ao lançamento contábil criado
- Futuramente será possível anexar comprovante de pagamento
