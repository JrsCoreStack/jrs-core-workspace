/**
 * Modelos relacionados a vínculos entre usuários e contas
 */

export interface UserAccount {
  id: string;
  user_id: string;
  account_id: string;
  role_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserAccountDTO {
  user_id: string;
  account_id: string;
  role_id?: string;
}

export interface UserAccountResponse {
  id: string;
  user_id: string;
  account_id: string;
  role_id?: string;
  created_at: string;
  updated_at: string;
}
