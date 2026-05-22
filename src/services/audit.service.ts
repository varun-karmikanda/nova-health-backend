import { randomUUID } from 'node:crypto';

import { AuditRepository } from '../repositories/audit.repository';
import { AuditAction, AuditLogWithSnapshot } from '../models/audit.dto';
import { UserModel } from '../models/user.schema';
import { logger } from '../config/logger';

export class AuditService {
  private auditRepository = new AuditRepository();

  public async logAction(
    action: AuditAction,
    entityType: string,
    entityId?: string,
    userIdOrEmail?: string,
    sourceIp?: string,
    beforeData?: Record<string, unknown> | null,
    afterData?: Record<string, unknown> | null,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    const logId = randomUUID();
    const timestamp = new Date().toISOString();

    let resolvedUserId: string | undefined;
    let userName: string | undefined;

    if (userIdOrEmail && userIdOrEmail !== 'system') {
      try {
        const query = userIdOrEmail.includes('@')
          ? { email: userIdOrEmail.toLowerCase() }
          : { _id: userIdOrEmail };
        const user = await UserModel.findOne(query).lean();
        if (user) {
          // eslint-disable-next-line no-underscore-dangle
          resolvedUserId = user._id;
          userName = `${user.first_name} ${user.last_name}`;
        } else if (userIdOrEmail.includes('@')) {
          // If user not found but it is an email address, keep it as the username display
          userName = userIdOrEmail;
        }
      } catch (err) {
        logger.error({ err }, 'Failed to resolve user name for audit log');
      }
    } else if (userIdOrEmail === 'system') {
      userName = 'System';
    }

    await this.auditRepository.createLog({
      id: logId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: resolvedUserId ?? userIdOrEmail,
      user_name: userName,
      timestamp,
      source_ip: sourceIp,
      changes,
    });

    if (beforeData != null || afterData != null) {
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
