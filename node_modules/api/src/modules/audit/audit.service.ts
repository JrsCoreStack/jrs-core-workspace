import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit_log.entity';

export interface AuditData {
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  account_id: string;
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
  ) {}

  async log(data: AuditData): Promise<void> {
    try {
      const changedFields = this.getChangedFields(
        data.old_values,
        data.new_values,
      );

      const auditLog = this.auditRepository.create({
        table_name: data.table_name,
        record_id: data.record_id,
        operation: data.operation,
        old_values: data.old_values,
        new_values: data.new_values,
        changed_fields: changedFields,
        user_id: data.user_id,
        account_id: data.account_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      });

      await this.auditRepository.save(auditLog);
    } catch (error) {
      console.error('Erro ao salvar log de auditoria:', error);
    }
  }

  private getChangedFields(
    old_values?: Record<string, any>,
    new_values?: Record<string, any>,
  ): string[] {
    if (!old_values || !new_values) return [];

    const changed: string[] = [];
    for (const key in new_values) {
      if (JSON.stringify(old_values[key]) !== JSON.stringify(new_values[key])) {
        changed.push(key);
      }
    }
    return changed;
  }

  async getAuditHistory(
    tableName: string,
    record_id: string,
    account_id: string,
  ) {
    return this.auditRepository.find({
      where: {
        table_name: tableName,
        record_id: record_id,
        account_id: account_id,
      },
      order: { timestamp: 'DESC' },
    });
  }

  async getAuditByAccount(account_id: string, limit = 100, offset = 0) {
    return this.auditRepository.find({
      where: { account_id: account_id },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getAuditByUser(
    user_id: string,
    account_id: string,
    limit = 100,
    offset = 0,
  ) {
    return this.auditRepository.find({
      where: { user_id: user_id, account_id: account_id },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
