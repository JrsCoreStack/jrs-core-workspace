# Configuração do NextAuth

Este projeto utiliza NextAuth.js v5 (Auth.js) para autenticação com sua própria API backend.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# NextAuth Configuration
AUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# API Configuration
# Use NEXT_PUBLIC_API_URL se sua API está em um domínio diferente
# Use API_URL se sua API está no mesmo domínio (apenas server-side)
NEXT_PUBLIC_API_URL=http://localhost:3001
# API_URL=http://localhost:3001

# NODE_ENV
NODE_ENV=development
```

### Gerando AUTH_SECRET

Para gerar um `AUTH_SECRET` seguro, execute:

```bash
openssl rand -base64 32
```

Ou use um gerador online de chaves seguras.

## Estrutura da API

O NextAuth está configurado para fazer login na rota `/auth/login` da sua API. A API deve aceitar:

**Request:**
```json
POST /auth/login
Content-Type: application/json

{
  "cpf": "12345678900",
  "password": "senha123"
}
```

**Response esperada (opção 1):**
```json
{
  "user": {
    "id": "123",
    "email": "usuario@example.com",
    "name": "Nome do Usuário"
  },
  "token": "jwt-token-here"
}
```

**Response esperada (opção 2):**
```json
{
  "id": "123",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "token": "jwt-token-here"
}
```

Se sua API retorna uma estrutura diferente, ajuste o arquivo `auth.ts` na função `authorize` do provider Credentials.

## Como Usar

### Fazer Login

O componente `LoginForm` já está integrado com NextAuth. Ao fazer login, o usuário será autenticado e redirecionado automaticamente.

### Verificar Sessão no Cliente

```tsx
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Carregando...</p>;
  if (status === "unauthenticated") return <p>Não autenticado</p>;
  
  return <p>Logado como: {session?.user?.email}</p>;
}
```

### Verificar Sessão no Servidor

```tsx
import { auth } from "@/auth";

export default async function ServerComponent() {
  const session = await auth();
  
  if (!session) {
    return <p>Não autenticado</p>;
  }
  
  return <p>Logado como: {session.user.email}</p>;
}
```

### Fazer Logout

```tsx
"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/auth" })}>
      Sair
    </button>
  );
}
```

### Acessar Token da API

```tsx
"use client";
import { useSession } from "next-auth/react";

export function ApiComponent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  
  // Use o token para fazer requisições autenticadas
}
```

## Proteção de Rotas

O middleware (`middleware.ts`) protege automaticamente todas as rotas, exceto:
- `/auth` - Página de login/registro
- `/api/auth/*` - Rotas do NextAuth

Todas as outras rotas requerem autenticação. Se o usuário não estiver autenticado, será redirecionado para `/auth`.

## Arquivos Importantes

- `auth.ts` - Configuração principal do NextAuth
- `app/api/auth/[...nextauth]/route.ts` - Route handler do NextAuth
- `middleware.ts` - Middleware para proteção de rotas
- `components/providers/auth-provider.tsx` - Provider do NextAuth
- `types/next-auth.d.ts` - Tipos TypeScript para NextAuth
