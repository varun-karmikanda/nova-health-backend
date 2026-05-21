import { z } from 'zod';

// ─── Constants ───────────────────────────────────────────────────────────────
export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

// ─── Address ─────────────────────────────────────────────────────────────────
export const AddressSchema = z.object({
  street: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  zip_code: z.string().optional().nullable().or(z.literal('')),
  country: z.string().optional().nullable().or(z.literal('')),
});

export type Address = z.infer<typeof AddressSchema>;

// ─── Create ──────────────────────────────────────────────────────────────────
export const CreatePatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(25),
  last_name: z.string().min(1, 'Last name is required').max(25),
  dob: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Date of birth must be a valid ISO-8601 date string',
  }),
  gender: z.enum(GENDERS),
  blood_group: z.enum(BLOOD_GROUPS),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: AddressSchema.optional().nullable(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

// ─── Update (partial of create) ──────────────────────────────────────────────
export const UpdatePatientSchema = CreatePatientSchema.partial();
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;

// ─── Entity ──────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: Gender;
  blood_group: BloodGroup;
  phone: string;
  email: string | null;
  address: Address;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}
