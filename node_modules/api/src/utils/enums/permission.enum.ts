export enum Permission {
  // ADMIN - Acesso total
  ADMIN_ALL = 'admin:all',

  // FINANCIAL
  FINANCIAL_VIEW_REPORTS = 'financial:view_reports',
  FINANCIAL_VIEW_ALL_TRANSACTIONS = 'financial:view_all_transactions',
  FINANCIAL_MANAGE_ACCOUNTS_PAYABLE = 'financial:manage_accounts_payable',
  FINANCIAL_MANAGE_ACCOUNTS_RECEIVABLE = 'financial:manage_accounts_receivable',
  FINANCIAL_MANAGE_CHART_OF_ACCOUNTS = 'financial:manage_chart_of_accounts',
  FINANCIAL_EXPORT_DATA = 'financial:export_data',

  // COMMERCIAL
  COMMERCIAL_VIEW_OWN_COMMISSION = 'commercial:view_own_commission',
  COMMERCIAL_VIEW_OWN_SALES = 'commercial:view_own_sales',
  COMMERCIAL_MANAGE_OWN_CLIENTS = 'commercial:manage_own_clients',

  // COMMERCIAL_MANAGER
  COMMERCIAL_MANAGER_VIEW_ALL_COMMISSIONS = 'commercial_manager:view_all_commissions',
  COMMERCIAL_MANAGER_VIEW_ALL_SALES = 'commercial_manager:view_all_sales',
  COMMERCIAL_MANAGER_MANAGE_ALL_CLIENTS = 'commercial_manager:manage_all_clients',
  COMMERCIAL_MANAGER_MANAGE_TEAM = 'commercial_manager:manage_team',
}
