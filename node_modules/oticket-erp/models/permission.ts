/**
 * Modelos relacionados a Roles e Permissões (RBAC)
 */

export enum UserRole {
  ADMIN = "ADMIN",
  FINANCIAL = "FINANCIAL",
  COMMERCIAL_MANAGER = "COMMERCIAL_MANAGER",
  COMMERCIAL = "COMMERCIAL",
}

export enum Permission {
  // Admin
  ADMIN_ALL = "admin:all",

  // Financial
  FINANCIAL_VIEW_REPORTS = "financial:view_reports",
  FINANCIAL_VIEW_ALL_TRANSACTIONS = "financial:view_all_transactions",
  FINANCIAL_MANAGE_ACCOUNTS_PAYABLE = "financial:manage_accounts_payable",
  FINANCIAL_MANAGE_ACCOUNTS_RECEIVABLE = "financial:manage_accounts_receivable",
  FINANCIAL_MANAGE_CHART_OF_ACCOUNTS = "financial:manage_chart_of_accounts",
  FINANCIAL_EXPORT_DATA = "financial:export_data",

  // Commercial
  COMMERCIAL_VIEW_OWN_COMMISSION = "commercial:view_own_commission",
  COMMERCIAL_VIEW_OWN_SALES = "commercial:view_own_sales",
  COMMERCIAL_MANAGE_OWN_CLIENTS = "commercial:manage_own_clients",

  // Commercial Manager
  COMMERCIAL_MANAGER_VIEW_ALL_COMMISSIONS = "commercial_manager:view_all_commissions",
  COMMERCIAL_MANAGER_VIEW_ALL_SALES = "commercial_manager:view_all_sales",
  COMMERCIAL_MANAGER_MANAGE_ALL_CLIENTS = "commercial_manager:manage_all_clients",
  COMMERCIAL_MANAGER_MANAGE_TEAM = "commercial_manager:manage_team",
}

export interface Role {
  id: string
  name: string
  code: UserRole
  description?: string
}

export interface PermissionModel {
  id: string
  name: string
  code: Permission
  description?: string
}

export interface UserAccountRole {
  user_id: string
  account_id: string
  role_id: string
  role?: Role
}
