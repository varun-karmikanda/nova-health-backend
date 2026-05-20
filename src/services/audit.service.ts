import { randomUUID } from 'node:crypto';
import { AuditRepository } from '../repositories/audit.repository';
import { AuditAction, AuditLogWithSnapshot } from '../models/audit.dto';

export class AuditService {
  private auditRepository = new AuditRepository();

  public async logAction(
    action: AuditAction,
    entityType: string,
    entityId?: string,
    userId?: string,
    sourceIp?: string,
    beforeData?: Record<string, unknown> | null,
    afterData?: Record<string, unknown> | null,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    const logId = randomUUID();
    const timestamp = new Date().toISOString();

    await this.auditRepository.createLog({
      id: logId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: userId,
      timestamp,
      source_ip: sourceIp,
      changes,
    });

    if (beforeData || afterData) {
      await this.auditRepository.createSnapshot({
        id: randomUUID(),
        audit_log_id: logId,
        before_data: beforeData ?? null,
        after_data: afterData ?? null,
      });
    }
  }

  public async listAllLogs(): Promise<AuditLogWithSnapshot[]> {
    return this.auditRepository.findAll();
  }

  public async getLogsByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLogWithSnapshot[]> {
    return this.auditRepository.findByEntity(entityType, entityId);
  }
}
