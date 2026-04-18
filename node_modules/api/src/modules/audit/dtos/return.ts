export class ReturnAuditDTO {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  userId?: string;
  accountId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
