/**
 * DTOs e tipos para Colaboradores
 */

export interface Employee {
  id: string
  cpf: string
  name: string
  email: string
  phone?: string
  accounts?: EmployeeAccount[]
  user_accounts?: UserAccountInEmployee[]
  lastAccess?: string
  last_login?: string
  role?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserAccountInEmployee {
  id: string
  user_id: string
  account_id: string
  role_id?: string
  role?: {
    id: string
    name: string
    code: string
  }
  created_at?: string
  updated_at?: string
}

export interface EmployeeAccount {
  id: string
  accountId: string
  accountName: string
  role: string
}

export interface CreateEmployeeDTO {
  cpf: string
  name: string
  email: string
  password: string
  phone?: string
}

export interface UpdateEmployeeDTO {
  cpf?: string
  name?: string
  email?: string
  password?: string
  phone?: string
}

export interface EmployeeListResponse {
  
  
}
