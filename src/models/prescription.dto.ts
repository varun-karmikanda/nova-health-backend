import { z } from 'zod';

export const PRESCRIPTION_STATUSES = ['draft', 'signed', 'dispensed'] as const;
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

// ─── Create ──────────────────────────────────────────────────────────────────
export const CreatePrescriptionSchema = z.object({
  encounter_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  medication_items: z.array(z.record(z.unknown())).min(1, 'At least one medication item is required'),
  instructions: z.string().optional(),
  refill_count: z.number().int().min(0).default(0),
});

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────
export const UpdatePrescriptionSchema = z.object({
  status: z.enum(PRESCRIPTION_STATUSES).optional(),
  medication_items: z.array(z.record(z.unknown())).optional(),
  instructions: z.string().optional(),
  refill_count: z.number().int().min(0).optional(),
});

export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>;

// ─── Entity ──────────────────────────────────────────────────────────────────
export interface Prescription {
  id: string;
  encounter_id: string;
  patient_id: string;
  doctor_id: string;
  medication_items: Record<string, unknown>[];
  instructions: string | null;
  issued_at: string;
  status: PrescriptionStatus;
  signed_at: string | null;
  refill_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
