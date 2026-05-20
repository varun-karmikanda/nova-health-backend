import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof GenderSchema>;

export const CreatePatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Date of birth must be a valid ISO-8601 date string',
  }),
  gender: GenderSchema,
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  email: z.string().email('Invalid email address').optional().nullable(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  phone: string;
  email?: string | null;
  createdAt: string;
}
