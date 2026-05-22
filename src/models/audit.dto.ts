import { z } from 'zod';

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'VIEW',
  'LOGIN',
  'ASSIGN_ROLE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid().optional(),
  action: z.enum(AUDIT_ACTIONS),
  user_id: z.string().optional(),
  user_name: z.string().optional(),
  timestamp: z.string(),
  source_ip: z.string().optional(),
  changes: z.record(z.unknown()).optional(), // Store unstructured change diff if needed
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditSnapshotSchema = z.object({
  id: z.string().uuid(),
  audit_log_id: z.string().uuid(),
  before_data: z.record(z.unknown()).nullable(),
  after_data: z.record(z.unknown()).nullable(),
});

export type AuditSnapshot = z.infer<typeof AuditSnapshotSchema>;

// For API responses, we often want the log with its snapshot
export type AuditLogWithSnapshot = AuditLog & {
  snapshot?: AuditSnapshot;
};
