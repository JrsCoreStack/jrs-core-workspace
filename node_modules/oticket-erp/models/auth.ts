/**
 * DTOs (Data Transfer Objects) para autenticação
 */

export interface SignInDTO {
  cpf: string;
  password: string;
}

export interface SignUpDTO {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

/**
 * Tipos de resposta da API
 */

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSignIn {
  user: User;
  token: string;
  accessToken?: string;
  refreshToken?: string;
  accounts?: Account[];
  role?: string;
  permissions?: string[];
}

// Alternativa caso a API retorne o usuário diretamente
export interface UserSignInAlternative {
  id: string;
  email: string;
  name?: string;
  username?: string;
  token: string;
  accessToken?: string;
  accounts?: Account[];
  role?: string;
  permissions?: string[];
}

/**
 * Tipos para Accounts
 */
export interface Account {
  id: string;
  name: string;
  code: string;
  email: string;
  type: number;
  level: string;
}

/**
 * DTO para resposta do updateToken
 */
export interface UpdateTokenResponse {
  token: string;
  account: Account;
  role: string;
  permissions?: string[];
}

/**
 * Tipos para o NextAuth
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  accessToken?: string;
  accounts?: Account[];
}
