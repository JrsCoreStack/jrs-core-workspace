# JRS Core Workspace — ERP (monorepo)

Monorepo do **JRS ERP**: API em NestJS + PostgreSQL (TypeORM) e interface web em Next.js. O nome do pacote na raiz é `jrs-erp-workspace` (npm workspaces). Se a sua pasta local se chama `jrs-core-workspace`, os comandos abaixo são os mesmos — basta executá-los na **raiz** desse repositório.

## Visão geral

| Parte | Pasta | Stack | Porta padrão (dev) |
|--------|--------|--------|---------------------|
| Backend | `Jrs-api-erp` | NestJS 11, TypeORM, PostgreSQL, Swagger | **8081** |
| Frontend | `Jrs-web-erp` | Next.js 16, React 19, Tailwind, NextAuth | **3000** |

- **API REST** e **Swagger**: `http://localhost:8081` (Swagger em `/api`).
- **Frontend**: `http://localhost:3000`.
- Em desenvolvimento, o Next.js expõe um **proxy** em `/api-proxy/*` que encaminha para a API (`next.config.ts`), evitando CORS no browser quando você não define `NEXT_PUBLIC_API_URL`.

---

## Pré-requisitos

1. **Node.js**  
   Recomendado: **20.x LTS** ou superior (o `Dockerfile` da API usa Node 20). Verifique com:

   ```bash
   node -v
   npm -v
   ```

2. **PostgreSQL**  
   Banco compatível com o TypeORM (versão suportada pelo seu provedor; em geral PostgreSQL 14+).

3. **Git** (para clonar o repositório).

4. **Windows**: opcionalmente **PowerShell** ou **CMD**; existe também o script `iniciar-dev.bat` na raiz.

---

## Clonar e instalar dependências

Na pasta onde você guarda projetos:

```bash
git clone <url-do-repositorio>
cd <pasta-do-repo>
```

Instale as dependências **na raiz** do monorepo (npm workspaces instala `Jrs-api-erp` e `Jrs-web-erp`):

```bash
npm install
```

Se preferir instalar projeto a projeto:

```bash
cd Jrs-api-erp && npm install && cd ..
cd Jrs-web-erp && npm install && cd ..
```

---

## Variáveis de ambiente — API (`Jrs-api-erp`)

Crie o arquivo **`Jrs-api-erp/.env`** (e opcionalmente `.env.local` — o Nest carrega os dois). Sem o `.env` o script `iniciar-dev.bat` avisa e encerra.

### Banco principal (obrigatório para subir a API)

| Variável | Descrição |
|----------|-----------|
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta (ex.: `5432`) |
| `DB_USERNAME` | Usuário |
| `DB_PASSWORD` | Senha |
| `DB_DATABASE` | Nome do banco |

### SSL do PostgreSQL (Neon, RDS, etc.)

| Variável | Descrição |
|----------|-----------|
| `DB_SSL` | `true` para habilitar SSL |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` se o provedor usar certificados que exigem isso (cuidado em produção) |

### Servidor HTTP e CORS

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `8081` | Porta da API |
| `CORS_ORIGIN` | `http://localhost:3000` | Origem permitida no CORS (frontend) |

### JWT (autenticação)

| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Segredo para assinar tokens |
| `JWT_EXPIRATION_TIME` | Ex.: `7d`, `24h` — usado pelo `JwtModule` |

### Integrações opcionais

- **`EXTERNAL_API_URL`**: usada em fluxos de *producer payout* (fallback existe no código; configure para o seu ambiente).
- **Sync de vendas (projeto integrado)** (`JRS_EXTERNAL_SALES_DB_*`, etc.): veja `Jrs-api-erp/src/modules/sales_sync/config/products.config.ts` e `Jrs-api-erp/docs/` quando for sincronizar a partir de outro Postgres.

Na subida, o TypeORM está configurado com **`migrationsRun: true`**: as migrations rodam automaticamente ao iniciar (desde que o banco exista e as credenciais estejam corretas).

---

## Variáveis de ambiente — Web (`Jrs-web-erp`)

Crie **`Jrs-web-erp/.env.local`** (recomendado para segredos locais).

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `AUTH_SECRET` | Sim (produção e dev estável) | Segredo do NextAuth. Gerar, por exemplo: `openssl rand -base64 32` |
| `AUTH_URL` | Recomendado | URL pública do app, ex.: `http://localhost:3000` |
| `API_URL` | Opcional | Base da API para código **server-side**; padrão lógico `http://127.0.0.1:8081` |
| `COCKPIT_API_ORIGIN` | Opcional | Se definido, tem prioridade sobre `API_URL` no `next.config` para o destino do proxy/rewrite |
| `NEXT_PUBLIC_API_URL` | Opcional | Se definido, o **browser** chama a API diretamente nessa URL (sem passar pelo `/api-proxy`) |
| `NEXT_PUBLIC_COCKPIT_TELEMETRY` | Opcional | `1` para logs de telemetria no console |
| `NEXT_PUBLIC_COCKPIT_TELEMETRY_URL` | Opcional | URL para POST de telemetria |

Detalhes de autenticação e contrato com a API: **`Jrs-web-erp/README-AUTH.md`**.

---

## Como executar em desenvolvimento

### Opção A — Script Windows (rápido)

Na raiz do repositório, dê duplo clique em **`iniciar-dev.bat`** ou execute no CMD:

```bat
iniciar-dev.bat
```

O script:

1. Verifica se `npm` está no PATH.
2. Exige **`Jrs-api-erp\.env`** presente.
3. Abre duas janelas: backend (`npm run dev` na API) e frontend (`npm run dev` no Next).
4. Backend em **8081**, frontend em **3000**.

Feche as janelas para parar os servidores.

### Opção B — Turbo na raiz (monorepo)

Com dependências já instaladas na raiz:

```bash
npm run dev
```

Isso executa **`turbo run dev`**, subindo as tarefas `dev` de `Jrs-api-erp` e `Jrs-web-erp` conforme `turbo.json`.

### Opção C — Terminais separados (controle manual)

**Terminal 1 — API:**

```bash
cd Jrs-api-erp
npm run dev
```

**Terminal 2 — Web:**

```bash
cd Jrs-web-erp
npm run dev
```

Ordem recomendada: primeiro a API (ou ambos quase ao mesmo tempo); o frontend tolera a API ainda subindo em alguns casos, mas login e dados dependem da API.

### URLs úteis após subir

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8081](http://localhost:8081)
- Swagger: [http://localhost:8081/api](http://localhost:8081/api)

---

## Build de produção

Na raiz:

```bash
npm run build
```

Ou por pacote:

```bash
cd Jrs-api-erp && npm run build
cd ../Jrs-web-erp && npm run build
```

**API — produção** (após build, o `package.json` usa `start` com migration + `nest start`):

```bash
cd Jrs-api-erp
npm run start
```

**Web — produção:**

```bash
cd Jrs-web-erp
npm run build
npm run start
```

Configure variáveis de ambiente de produção no host (Docker, VPS, Vercel, etc.). O `Dockerfile` em `Jrs-api-erp` expõe a porta **8080** na imagem, enquanto o código local usa **8081** por padrão — alinhe `PORT` / mapeamento de portas ao publicar.

---

## Scripts úteis (API)

Executados dentro de **`Jrs-api-erp`**:

| Comando | Função |
|---------|--------|
| `npm run dev` | Nest em modo watch |
| `npm run migration:run` | Rodar migrations manualmente (CLI TypeORM) |
| `npm run migration:revert` | Reverter última migration |
| `npm run migration:create -- src/migrations/Nome` | Criar arquivo de migration (ajuste o nome) |
| `npm run seed` | Executar seed (`src/database/seeds/seed.ts`) |
| `npm run test` | Testes Jest |
| `npm run lint` | ESLint |

---

## Scripts úteis (Web)

Dentro de **`Jrs-web-erp`**:

| Comando | Função |
|---------|--------|
| `npm run dev` | Servidor de desenvolvimento Next.js |
| `npm run build` | Build de produção |
| `npm run start` | Servidor Next após build |
| `npm run lint` | ESLint |

Documentação extra: **`Jrs-web-erp/README-SERVICES.md`**, **`Jrs-web-erp/README-AUTH.md`**.

---

## Lint e testes no monorepo

Na raiz:

```bash
npm run lint
npm run test
```

Delegam a `turbo run lint` e `turbo run test` nos workspaces que definem esses scripts.

---

## Estrutura de pastas (resumo)

```
.
├── Jrs-api-erp/          # Backend NestJS
├── Jrs-web-erp/          # Frontend Next.js
├── iniciar-dev.bat       # Atalho Windows para dev (API + Web)
├── package.json          # Workspaces + scripts turbo
├── turbo.json            # Pipeline Turbo
└── README.md             # Este arquivo
```

---

## Resolução de problemas

- **API não sobe / erro de conexão com o banco**: confira `DB_*` no `.env`, se o PostgreSQL está rodando e se o banco foi criado.
- **Migrations falham**: veja logs do Nest; corrija credenciais e versão do schema.
- **CORS no browser**: em dev, prefira não setar `NEXT_PUBLIC_API_URL` e usar o proxy `/api-proxy`; ou alinhe `CORS_ORIGIN` com a URL exata do frontend (incluindo porta).
- **NextAuth / login**: `AUTH_SECRET` e `AUTH_URL` corretos; veja `README-AUTH.md` no frontend.
- **Porta em uso**: altere `PORT` na API ou a porta do Next (`next dev -p <porta>`).

---

## Licenças e créditos

Os subprojetos podem conter READMEs herdados de templates (Nest/Next). Consulte os `package.json` de cada pasta para licenças específicas.
