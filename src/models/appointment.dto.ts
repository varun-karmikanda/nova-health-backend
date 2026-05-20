import { z } from 'zod';

export const AppointmentStatusSchema = z.enum(['scheduled', 'completed', 'cancelled', 'no_show']);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const BookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  scheduledAt: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Scheduled date must be a valid ISO-8601 date string',
  }),
  durationMinutes: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(240, 'Duration cannot exceed 4 hours'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}
