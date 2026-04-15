# Estrutura de Services e Hooks

Este projeto utiliza uma arquitetura organizada com services e hooks para fazer requisições à API usando Axios.

## Estrutura

```
├── models/          # Tipos e interfaces (DTOs)
├── services/        # Services para Server Components/Actions
├── hooks/           # Hooks para Client Components
└── utils/           # Utilitários (configuração do axios)
```

## Arquivos Principais

### `utils/api.ts`
Configuração central do Axios com interceptors para:
- Adicionar token de autenticação automaticamente
- Tratar erros globalmente
- Configurar timeout e headers padrão

### `models/auth.ts`
Tipos TypeScript para autenticação:
- `SignInDTO` - Dados para login (cpf e password)
- `SignUpDTO` - Dados para registro
- `User` - Modelo de usuário
- `UserSignIn` - Resposta de login com user e token
- `UserSignInAlternative` - Resposta alternativa de login

### `utils/auth-utils.ts`
Funções utilitárias de autenticação (uso em Server Components/Actions ou Client Components):
```typescript
import { signInUser } from "@/utils/auth-utils";

const result = await signInUser({ cpf: "12345678900", password: "senha123" });
```

### `hooks/use-auth-service.ts`
Hook para operações de autenticação (uso em Client Components):
```typescript
import { useAuthService } from "@/hooks/use-auth-service";

const { SIGNIN, SIGNUP, authenticatedRequest } = useAuthService();
```

## Como Usar

### Em Client Components

```tsx
"use client";
import { useAuthService } from "@/hooks/use-auth-service";
import { SignInDTO } from "@/models/auth";

export function MyComponent() {
  const { SIGNIN, isAuthenticated } = useAuthService();

  const handleLogin = async () => {
    try {
      const data: SignInDTO = {
        cpf: "12345678900",
        password: "password123",
      };
      
      const result = await SIGNIN(data);
      console.log(result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Em Server Components ou Server Actions

```tsx
import { authService } from "@/services/auth-service";
import { SignInDTO } from "@/models/auth";

export async function ServerComponent() {
  const data: SignInDTO = {
    email: "user@example.com",
    password: "password123",
  };
  
  const result = await authService.signIn(data);
  return <div>{result?.user?.email}</div>;
}
```

### Fazendo Requisições Autenticadas

#### Em Client Components:
```tsx
"use client";
import { useAuthService } from "@/hooks/use-auth-service";

export function MyComponent() {
  const { authenticatedRequest } = useAuthService();

  const fetchData = async () => {
    try {
      const data = await authenticatedRequest("get", "/users/me");
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

#### Em Server Components:
```tsx
import { auth } from "@/auth";
import api from "@/utils/api";

export async function ServerComponent() {
  const session = await auth();
  
  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  
  return <div>{response.data.email}</div>;
}
```

## Criando Novos Services

### 1. Criar tipos no `models/`

```typescript
// models/user.ts
export interface UserDTO {
  name: string;
  email: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}
```

### 2. Criar service em `services/`

```typescript
// services/user-service.ts
import { UserDTO, UserResponse } from "@/models/user";
import api from "@/utils/api";

export const userService = {
  create: async (data: UserDTO): Promise<UserResponse | null> => {
    try {
      const response = await api.post<UserResponse>("/users", data);
      return response.data;
    } catch (error) {
      console.error("Create user error:", error);
      return null;
    }
  },

  getById: async (id: string): Promise<UserResponse | null> => {
    try {
      const response = await api.get<UserResponse>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },
};
```

### 3. Criar hook em `hooks/` (se necessário para Client Components)

```typescript
// hooks/use-user-service.ts
"use client";
import { useAuthService } from "@/hooks/use-auth-service";
import { UserDTO, UserResponse } from "@/models/user";
import { useCallback } from "react";

export const useUserService = () => {
  const { authenticatedRequest } = useAuthService();

  const CREATE = useCallback(
    async (data: UserDTO): Promise<UserResponse | undefined> => {
      return authenticatedRequest<UserResponse>("post", "/users", data);
    },
    [authenticatedRequest]
  );

  const GET_BY_ID = useCallback(
    async (id: string): Promise<UserResponse | undefined> => {
      return authenticatedRequest<UserResponse>("get", `/users/${id}`);
    },
    [authenticatedRequest]
  );

  return {
    CREATE,
    GET_BY_ID,
  };
};
```

## Configuração

A URL da API é configurada via variável de ambiente:
- `NEXT_PUBLIC_API_URL` - Para uso no cliente
- `API_URL` - Para uso no servidor (fallback)

Configure no `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Tratamento de Erros

O Axios está configurado com interceptors que tratam erros automaticamente. Os erros são rejeitados com a seguinte estrutura:

```typescript
{
  status: number;
  message: string;
  data: any;
}
```

Sempre use try/catch ao chamar os services:

```typescript
try {
  const result = await SIGNIN(data);
} catch (error: any) {
  console.error(error.message);
  console.error(error.status);
}
```
