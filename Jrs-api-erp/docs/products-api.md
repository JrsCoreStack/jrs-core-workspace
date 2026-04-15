# API de Produtos e Categorias

Documentação completa da API para gerenciamento de produtos/serviços e suas categorias.

---

## 📋 Índice

1. [Categorias de Produtos](#categorias-de-produtos)
   - [Criar Categoria](#1-criar-categoria)
   - [Listar Categorias](#2-listar-categorias)
   - [Buscar Categoria por ID](#3-buscar-categoria-por-id)
   - [Atualizar Categoria](#4-atualizar-categoria)
   - [Deletar Categoria](#5-deletar-categoria)

2. [Produtos/Serviços](#produtosserviços)
   - [Criar Produto](#1-criar-produto)
   - [Listar Produtos](#2-listar-produtos)
   - [Buscar Produto por ID](#3-buscar-produto-por-id)
   - [Listar Produtos por Categoria](#4-listar-produtos-por-categoria)
   - [Atualizar Produto](#5-atualizar-produto)
   - [Deletar Produto](#6-deletar-produto)

---

## Categorias de Produtos

### 1. Criar Categoria

**Endpoint:** `POST /product-category`

**Descrição:** Cria uma nova categoria de produtos/serviços.

**Body (JSON):**
```json
{
  "name": "Ingressos"
}
```

**Validações:**
- `name`: Obrigatório, string, máximo 255 caracteres, único

**Resposta de Sucesso (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ingressos",
  "created_at": "2026-02-04T12:00:00.000Z",
  "updated_at": "2026-02-04T12:00:00.000Z"
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": "Já existe uma categoria com o nome \"Ingressos\"",
  "error": "Bad Request"
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:8080/product-category \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingressos"
  }'
```

---

### 2. Listar Categorias

**Endpoint:** `GET /product-category`

**Descrição:** Lista todas as categorias cadastradas, ordenadas por nome.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ingressos",
    "created_at": "2026-02-04T12:00:00.000Z",
    "updated_at": "2026-02-04T12:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Produtos Físicos",
    "created_at": "2026-02-04T13:00:00.000Z",
    "updated_at": "2026-02-04T13:00:00.000Z"
  }
]
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:8080/product-category
```

---

### 3. Buscar Categoria por ID

**Endpoint:** `GET /product-category/:id`

**Descrição:** Busca uma categoria específica pelo ID.

**Parâmetros:**
- `id` (UUID): ID da categoria

**Resposta de Sucesso (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ingressos",
  "created_at": "2026-02-04T12:00:00.000Z",
  "updated_at": "2026-02-04T12:00:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Categoria não encontrada.",
  "error": "Not Found"
}
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:8080/product-category/550e8400-e29b-41d4-a716-446655440000
```

---

### 4. Atualizar Categoria

**Endpoint:** `PUT /product-category/:id`

**Descrição:** Atualiza os dados de uma categoria existente.

**Parâmetros:**
- `id` (UUID): ID da categoria

**Body (JSON):**
```json
{
  "name": "Ingressos Online"
}
```

**Validações:**
- `name`: Opcional, string, máximo 255 caracteres, único

**Resposta de Sucesso (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ingressos Online",
  "created_at": "2026-02-04T12:00:00.000Z",
  "updated_at": "2026-02-04T14:00:00.000Z"
}
```

**Exemplo de Requisição:**
```bash
curl -X PUT http://localhost:8080/product-category/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingressos Online"
  }'
```

---

### 5. Deletar Categoria

**Endpoint:** `DELETE /product-category/:id`

**Descrição:** Remove uma categoria do sistema. Produtos associados terão `category_id` definido como `null`.

**Parâmetros:**
- `id` (UUID): ID da categoria

**Resposta de Sucesso (200):**
```json
{
  "message": "Categoria deletada com sucesso"
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Categoria não encontrada.",
  "error": "Not Found"
}
```

**Exemplo de Requisição:**
```bash
curl -X DELETE http://localhost:8080/product-category/550e8400-e29b-41d4-a716-446655440000
```

---

## Produtos/Serviços

### 1. Criar Produto

**Endpoint:** `POST /product`

**Descrição:** Cria um novo produto ou serviço.

**Body (JSON):**
```json
{
  "name": "Ingresso VIP",
  "description": "Ingresso VIP com acesso à área exclusiva",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost_value": 50.00,
  "unit_sale_value": 150.00,
  "is_recurring": false,
  "max_discount_percentage": 10.00,
  "is_active": true
}
```

**Campos:**
- `name` (string, obrigatório): Nome do produto/serviço (máx. 255 caracteres)
- `description` (string, opcional): Descrição detalhada do produto
- `category_id` (UUID, opcional): ID da categoria (pode ser `null`)
- `cost_value` (number, obrigatório): Valor de custo (≥ 0, 2 casas decimais)
- `unit_sale_value` (number, obrigatório): Valor unitário de venda (≥ 0, 2 casas decimais)
- `is_recurring` (boolean, opcional): Se é recorrência (padrão: `false`)
- `max_discount_percentage` (number, opcional): Desconto máximo permitido em % (0-100, padrão: `0`)
- `is_active` (boolean, opcional): Se está ativo (padrão: `true`)

**Validações:**
- `name`: Obrigatório, máximo 255 caracteres
- `cost_value`: Obrigatório, ≥ 0, máximo 2 casas decimais
- `unit_sale_value`: Obrigatório, ≥ 0, máximo 2 casas decimais
- `max_discount_percentage`: 0-100, máximo 2 casas decimais
- `category_id`: Deve existir no banco (se fornecido)

**Resposta de Sucesso (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Ingresso VIP",
  "description": "Ingresso VIP com acesso à área exclusiva",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost_value": "50.00",
  "unit_sale_value": "150.00",
  "is_recurring": false,
  "max_discount_percentage": "10.00",
  "is_active": true,
  "created_at": "2026-02-04T15:00:00.000Z",
  "updated_at": "2026-02-04T15:00:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ingressos",
    "created_at": "2026-02-04T12:00:00.000Z",
    "updated_at": "2026-02-04T12:00:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": "Dados inválidos: Nome é obrigatório, Valor de custo é obrigatório",
  "error": "Bad Request"
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:8080/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingresso VIP",
    "description": "Ingresso VIP com acesso à área exclusiva",
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "cost_value": 50.00,
    "unit_sale_value": 150.00,
    "is_recurring": false,
    "max_discount_percentage": 10.00,
    "is_active": true
  }'
```

---

### 2. Listar Produtos

**Endpoint:** `GET /product`

**Descrição:** Lista todos os produtos cadastrados, ordenados por nome.

**Query Parameters:**
- `includeInactive` (boolean, opcional): Se `true`, inclui produtos inativos (padrão: `false`)

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Ingresso VIP",
    "description": "Ingresso VIP com acesso à área exclusiva",
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "cost_value": "50.00",
    "unit_sale_value": "150.00",
    "is_recurring": false,
    "max_discount_percentage": "10.00",
    "is_active": true,
    "created_at": "2026-02-04T15:00:00.000Z",
    "updated_at": "2026-02-04T15:00:00.000Z",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ingressos",
      "created_at": "2026-02-04T12:00:00.000Z",
      "updated_at": "2026-02-04T12:00:00.000Z"
    }
  }
]
```

**Exemplos de Requisição:**
```bash
# Listar apenas produtos ativos
curl -X GET http://localhost:8080/product

# Listar todos os produtos (incluindo inativos)
curl -X GET "http://localhost:8080/product?includeInactive=true"
```

---

### 3. Buscar Produto por ID

**Endpoint:** `GET /product/:id`

**Descrição:** Busca um produto específico pelo ID, incluindo dados da categoria.

**Parâmetros:**
- `id` (UUID): ID do produto

**Resposta de Sucesso (200):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Ingresso VIP",
  "description": "Ingresso VIP com acesso à área exclusiva",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost_value": "50.00",
  "unit_sale_value": "150.00",
  "is_recurring": false,
  "max_discount_percentage": "10.00",
  "is_active": true,
  "created_at": "2026-02-04T15:00:00.000Z",
  "updated_at": "2026-02-04T15:00:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ingressos",
    "created_at": "2026-02-04T12:00:00.000Z",
    "updated_at": "2026-02-04T12:00:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Produto não encontrado.",
  "error": "Not Found"
}
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:8080/product/770e8400-e29b-41d4-a716-446655440002
```

---

### 4. Listar Produtos por Categoria

**Endpoint:** `GET /product/category/:categoryId`

**Descrição:** Lista todos os produtos de uma categoria específica.

**Parâmetros:**
- `categoryId` (UUID): ID da categoria

**Query Parameters:**
- `includeInactive` (boolean, opcional): Se `true`, inclui produtos inativos (padrão: `false`)

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Ingresso VIP",
    "description": "Ingresso VIP com acesso à área exclusiva",
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "cost_value": "50.00",
    "unit_sale_value": "150.00",
    "is_recurring": false,
    "max_discount_percentage": "10.00",
    "is_active": true,
    "created_at": "2026-02-04T15:00:00.000Z",
    "updated_at": "2026-02-04T15:00:00.000Z",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ingressos",
      "created_at": "2026-02-04T12:00:00.000Z",
      "updated_at": "2026-02-04T12:00:00.000Z"
    }
  }
]
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:8080/product/category/550e8400-e29b-41d4-a716-446655440000
```

---

### 5. Atualizar Produto

**Endpoint:** `PUT /product/:id`

**Descrição:** Atualiza os dados de um produto existente.

**Parâmetros:**
- `id` (UUID): ID do produto

**Body (JSON):**
```json
{
  "name": "Ingresso VIP Premium",
  "unit_sale_value": 200.00,
  "max_discount_percentage": 15.00
}
```

**Campos (todos opcionais):**
- `name`: Nome do produto
- `description`: Descrição
- `category_id`: ID da categoria (pode ser `null` para remover categoria)
- `cost_value`: Valor de custo
- `unit_sale_value`: Valor unitário de venda
- `is_recurring`: Se é recorrência
- `max_discount_percentage`: Desconto máximo permitido (%)
- `is_active`: Se está ativo

**Validações:**
- Mesmas validações do endpoint de criação
- `category_id`: Deve existir no banco (se fornecido)

**Resposta de Sucesso (200):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Ingresso VIP Premium",
  "description": "Ingresso VIP com acesso à área exclusiva",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost_value": "50.00",
  "unit_sale_value": "200.00",
  "is_recurring": false,
  "max_discount_percentage": "15.00",
  "is_active": true,
  "created_at": "2026-02-04T15:00:00.000Z",
  "updated_at": "2026-02-04T16:00:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ingressos",
    "created_at": "2026-02-04T12:00:00.000Z",
    "updated_at": "2026-02-04T12:00:00.000Z"
  }
}
```

**Exemplo de Requisição:**
```bash
curl -X PUT http://localhost:8080/product/770e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingresso VIP Premium",
    "unit_sale_value": 200.00,
    "max_discount_percentage": 15.00
  }'
```

---

### 6. Deletar Produto

**Endpoint:** `DELETE /product/:id`

**Descrição:** Remove um produto do sistema permanentemente.

**Parâmetros:**
- `id` (UUID): ID do produto

**Resposta de Sucesso (200):**
```json
{
  "message": "Produto deletado com sucesso"
}
```

**Resposta de Erro (404):**
```json
{
  "statusCode": 404,
  "message": "Produto não encontrado.",
  "error": "Not Found"
}
```

**Exemplo de Requisição:**
```bash
curl -X DELETE http://localhost:8080/product/770e8400-e29b-41d4-a716-446655440002
```

---

## 📝 Notas Importantes

### Valores Decimais
- Todos os valores monetários são retornados como strings no formato decimal (ex: `"150.00"`)
- Ao enviar valores, use números (ex: `150.00` ou `150`)

### Relacionamento Categoria-Produto
- Um produto pode não ter categoria (`category_id` = `null`)
- Ao deletar uma categoria, os produtos associados terão `category_id` definido como `null` (não são deletados)
- Ao atualizar um produto, você pode remover a categoria passando `category_id: null`

### Status Ativo/Inativo
- Por padrão, produtos são criados como ativos (`is_active: true`)
- Ao listar produtos sem `includeInactive=true`, apenas produtos ativos são retornados
- Produtos inativos não são deletados, apenas marcados como inativos

### Recorrência
- Campo `is_recurring` indica se o produto/serviço é recorrente (ex: assinatura mensal)
- Por padrão, produtos são criados como não recorrentes (`is_recurring: false`)

### Desconto Máximo
- O campo `max_discount_percentage` define o desconto máximo permitido em porcentagem
- Valores válidos: 0 a 100
- Por padrão, produtos são criados com `max_discount_percentage: 0`

---

## 🔒 Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou validação falhou
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

---

## 📚 Exemplos de Casos de Uso

### Criar um produto simples sem categoria
```json
POST /product
{
  "name": "Produto Teste",
  "cost_value": 10.00,
  "unit_sale_value": 25.00
}
```

### Criar um produto com todos os campos
```json
POST /product
{
  "name": "Assinatura Mensal Premium",
  "description": "Acesso completo a todas as funcionalidades",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "cost_value": 0.00,
  "unit_sale_value": 99.90,
  "is_recurring": true,
  "max_discount_percentage": 20.00,
  "is_active": true
}
```

### Desativar um produto (sem deletar)
```json
PUT /product/:id
{
  "is_active": false
}
```

### Remover categoria de um produto
```json
PUT /product/:id
{
  "category_id": null
}
```
