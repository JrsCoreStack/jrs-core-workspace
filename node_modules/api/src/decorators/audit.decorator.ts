import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  tableName: string;
  operation?: 'INSERT' | 'UPDATE' | 'DELETE';
}

export const Audit = (options: AuditOptions | string) => {
  const auditOptions =
    typeof options === 'string' ? { tableName: options } : options;

  return SetMetadata(AUDIT_KEY, auditOptions);
};
