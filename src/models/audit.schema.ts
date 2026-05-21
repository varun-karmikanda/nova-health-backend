import { Schema, model } from 'mongoose';
import { AuditAction } from './audit.dto';

// --- AuditLog Schema ---
export interface AuditLogDoc {
  _id: string;
  entity_type: string;
  entity_id?: string;
  action: AuditAction;
  user_id?: string;
  timestamp: string;
  source_ip?: string;
  changes?: Record<string, unknown>;
}

const AuditLogSchema = new Schema<AuditLogDoc>(
  {
    _id: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: String },
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'ASSIGN_ROLE'], required: true },
    user_id: { type: String },
    timestamp: { type: String, required: true },
    source_ip: { type: String },
    changes: { type: Schema.Types.Mixed },
  },
  { collection: 'audit_logs', _id: false }
);

export const AuditLogModel = model<AuditLogDoc>('AuditLog', AuditLogSchema);

// --- AuditSnapshot Schema ---
export interface AuditSnapshotDoc {
  _id: string;
  audit_log_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
}

const AuditSnapshotSchema = new Schema<AuditSnapshotDoc>(
  {
    _id: { type: String, required: true },
    audit_log_id: { type: String, required: true },
    before_data: { type: Schema.Types.Mixed, default: null },
    after_data: { type: Schema.Types.Mixed, default: null },
  },
  { collection: 'audit_snapshots', _id: false }
);

export const AuditSnapshotModel = model<AuditSnapshotDoc>('AuditSnapshot', AuditSnapshotSchema);
