import { z } from 'zod';

// ─── Create ──────────────────────────────────────────────────────────────────
export const CreateEncounterSchema = z.object({
  appointment_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  encounter_date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Encounter date must be a valid ISO-8601 date string',
  }),
  symptoms: z.string().min(1, 'Symptoms are required'),
  vitals: z.record(z.unknown()).optional(),
  diagnoses: z.array(z.string()).optional(),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.record(z.unknown())).optional(),
});

export type CreateEncounterInput = z.infer<typeof CreateEncounterSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────
export const UpdateEncounterSchema = CreateEncounterSchema.partial();
export type UpdateEncounterInput = z.infer<typeof UpdateEncounterSchema>;

// ─── Entity ──────────────────────────────────────────────────────────────────
export interface Encounter {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  encounter_date: string;
  symptoms: string;
  vitals: Record<string, unknown> | null;
  diagnoses: string[];
  treatment_plan: string | null;
  notes: string | null;
  attachments: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
