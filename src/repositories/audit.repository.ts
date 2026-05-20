import { AuditLog, AuditSnapshot, AuditLogWithSnapshot } from '../models/audit.dto';

export class AuditRepository {
  private static logs: AuditLog[] = [];

  private static snapshots: AuditSnapshot[] = [];

  public createLog(log: AuditLog): Promise<AuditLog> {
    AuditRepository.logs.push(log);
    return Promise.resolve(log);
  }

  public createSnapshot(snapshot: AuditSnapshot): Promise<AuditSnapshot> {
    AuditRepository.snapshots.push(snapshot);
    return Promise.resolve(snapshot);
  }

  public findAll(): Promise<AuditLogWithSnapshot[]> {
    const enrichedLogs: AuditLogWithSnapshot[] = AuditRepository.logs.map((log) => {
      const snapshot = AuditRepository.snapshots.find((s) => s.audit_log_id === log.id);
      return snapshot ? { ...log, snapshot } : { ...log };
    });
    // Sort descending by timestamp
    return Promise.resolve(
      enrichedLogs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    );
  }

  public findByEntity(entityType: string, entityId: string): Promise<AuditLogWithSnapshot[]> {
    const logs = AuditRepository.logs.filter(
      (log) => log.entity_type === entityType && log.entity_id === entityId,
    );
    const enrichedLogs: AuditLogWithSnapshot[] = logs.map((log) => {
      const snapshot = AuditRepository.snapshots.find((s) => s.audit_log_id === log.id);
      return snapshot ? { ...log, snapshot } : { ...log };
    });
    return Promise.resolve(
      enrichedLogs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    );
  }
}
