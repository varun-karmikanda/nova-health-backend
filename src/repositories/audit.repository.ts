import { AuditLogModel, AuditSnapshotModel } from '../models/audit.schema';
import { AuditLog, AuditSnapshot, AuditLogWithSnapshot } from '../models/audit.dto';

export class AuditRepository {
  public async createLog(log: AuditLog): Promise<AuditLog> {
    const created = await AuditLogModel.create({
      _id: log.id,
      ...log,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async createSnapshot(snapshot: AuditSnapshot): Promise<AuditSnapshot> {
    const created = await AuditSnapshotModel.create({
      _id: snapshot.id,
      ...snapshot,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<AuditLogWithSnapshot[]> {
    const logs = await AuditLogModel.find().lean();
    const logIds = logs.map((log) => log._id);
    const snapshots = await AuditSnapshotModel.find({ audit_log_id: { $in: logIds } }).lean();

    const enrichedLogs: AuditLogWithSnapshot[] = logs.map((log) => {
      const snapshot = snapshots.find((s) => s.audit_log_id === log._id);
      const { _id: logId, ...logRest } = log;
      const formattedLog = { id: logId, ...logRest } as any;

      if (snapshot) {
        const { _id: snapId, ...snapRest } = snapshot;
        formattedLog.snapshot = { id: snapId, ...snapRest } as any;
      }
      return formattedLog;
    });

    return enrichedLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  public async findByEntity(entityType: string, entityId: string): Promise<AuditLogWithSnapshot[]> {
    const logs = await AuditLogModel.find({ entity_type: entityType, entity_id: entityId }).lean();
    const logIds = logs.map((log) => log._id);
    const snapshots = await AuditSnapshotModel.find({ audit_log_id: { $in: logIds } }).lean();

    const enrichedLogs: AuditLogWithSnapshot[] = logs.map((log) => {
      const snapshot = snapshots.find((s) => s.audit_log_id === log._id);
      const { _id: logId, ...logRest } = log;
      const formattedLog = { id: logId, ...logRest } as any;

      if (snapshot) {
        const { _id: snapId, ...snapRest } = snapshot;
        formattedLog.snapshot = { id: snapId, ...snapRest } as any;
      }
      return formattedLog;
    });

    return enrichedLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }
}
