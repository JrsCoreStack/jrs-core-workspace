# Deploy: Neon + Railway + Vercel

Este repositório é um monorepo (`Jrs-api-erp` = API NestJS, `Jrs-web-erp` = Next.js). A ordem recomendada é: **Neon (Postgres)** → **Railway (API)** → **Vercel (front)**, depois apontar CORS e URLs públicas.

## 1. Banco de dados — Neon

1. Crie um projeto em [Neon](https://neon.tech) e um banco (ex.: `neondb`).
2. Copie a **connection string** Postgres (modo `psql` ou URI). Ela costuma incluir `?sslmode=require`.
3. Guarde como `DATABASE_URL` — a API já aceita essa variável (veja `Jrs-api-erp/.env.example`).

**Migrações:** na subida, o Nest executa migrações TypeORM automaticamente (`migrationsRun: true` em `app.module.ts`). Para rodar manualmente no seu PC, use `npm run migration:run` dentro de `Jrs-api-erp` com o mesmo `.env`.

## 2. Backend — Railway

1. Crie um serviço a partir deste repositório Git.
2. **Raiz do projeto:** use a raiz do monorepo (pasta que contém `package.json` com `workspaces`), para o `npm ci` resolver dependências corretamente.
3. **Variáveis de ambiente** (mínimo):

   | Variável | Valor |
   |----------|--------|
   | `DATABASE_URL` | Connection string do Neon |
   | `JWT_SECRET` | Segredo forte (ex.: `openssl rand -base64 32`) |
   | `JWT_EXPIRATION_TIME` | Ex.: `7d` |
   | `PORT` | Deixe em branco ou omita — o Railway define `PORT` |
   | `CORS_ORIGIN` | URL do front na Vercel, ex. `https://seu-app.vercel.app` |
   | `NODE_ENV` | `production` |

4. **Build e start** (scripts já existentes na raiz):

   - Install: `npm ci`
   - Build: `npm run build:api`  
     (equivale a `npm run build -w api`)
   - Start: `npm run start:api:prod`  
     (equivale a `npm run start:prod -w api` → `node dist/main` no pacote `api`)

5. Após o deploy, anote a **URL pública HTTPS** do serviço (ex.: `https://xxxx.up.railway.app`). Ela será usada no front como `NEXT_PUBLIC_API_URL` e, no servidor Next, como `API_URL`.

**Swagger:** `https://SUA-URL-RAILWAY/api`

## 3. Frontend — Vercel

1. Importe o mesmo repositório na [Vercel](https://vercel.com).
2. **Root Directory:** use a raiz do monorepo **ou** configure comandos a partir da raiz (recomendado para workspaces):

   - **Framework:** Next.js  
   - **Install Command:** `npm ci` (na raiz)  
   - **Build Command:** `npm run build:web`  
     (equivale a `npm run build -w oticket-erp`)  
   - **Output:** o Next não usa output estático por padrão; a Vercel detecta o app em `Jrs-web-erp` se você apontar **Root Directory** para `Jrs-web-erp` e rodar `npm install` a partir da raiz — a opção mais simples na Vercel é:
     - **Root Directory** = `Jrs-web-erp`
     - **Install Command:** `cd .. && npm ci` (sobe um nível e instala o workspace), **ou** use a raiz como no Railway e `build:web` como acima.

   Ajuste conforme a opção que a interface da Vercel permitir (instalação na raiz + build com `-w oticket-erp` é a mais previsível em monorepos).

3. **Variáveis de ambiente** (Production):

   | Variável | Valor |
   |----------|--------|
   | `AUTH_SECRET` | Mesmo tipo de segredo forte que o JWT (pode ser outro valor) |
   | `AUTH_URL` | URL do site na Vercel, ex. `https://seu-app.vercel.app` |
   | `NEXT_PUBLIC_API_URL` | URL pública da API no Railway (terminada sem `/`) |
   | `API_URL` | Igual a `NEXT_PUBLIC_API_URL` (para NextAuth e server components chamarem a API sem passar pelo proxy do browser) |

4. Faça um novo deploy após salvar as variáveis.

## 4. Checklist pós-deploy

- [ ] Login no front funciona (NextAuth chama `/auth/login` na API).
- [ ] Navegação autenticada não retorna 401 por CORS (confira `CORS_ORIGIN` na API = URL exata do front).
- [ ] `NEXT_PUBLIC_API_URL` e `API_URL` apontam para o mesmo host HTTPS da Railway.

## 5. Desenvolvimento local

Copie os exemplos:

- `Jrs-api-erp/.env.example` → `Jrs-api-erp/.env` ou `.env.local`
- `Jrs-web-erp/.env.example` → `Jrs-web-erp/.env.local`

Suba API (porta padrão `8081`) e web (`npm run dev` na pasta do front ou `turbo` na raiz).
