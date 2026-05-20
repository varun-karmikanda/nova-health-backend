import { z } from 'zod';

// ─── Constants ───────────────────────────────────────────────────────────────
export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'arrived',
  'completed',
  'cancelled',
  'no-show',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// ─── Create ──────────────────────────────────────────────────────────────────
export const BookAppointmentSchema = z.object({
  patient_id: z.string().uuid('Patient ID must be a valid UUID'),
  doctor_id: z.string().uuid('Doctor ID must be a valid UUID'),
  scheduled_at: z.string().refine(
    (val) => !Number.isNaN(Date.parse(val)),
    { message: 'Scheduled date must be a valid ISO-8601 date string' },
  ),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────
export const UpdateAppointmentSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  scheduled_at: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Scheduled date must be a valid ISO-8601 date string',
    })
    .optional(),
  reason: z.string().min(3).optional(),
});

export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;

// ─── Entity ──────────────────────────────────────────────────────────────────
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  token_number: number;
  status: AppointmentStatus;
  reason: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
