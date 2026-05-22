import { z } from 'zod';

// ─── Role ────────────────────────────────────────────────────────────────────
export const UserRoleSchema = z.enum([
  'admin',
  'doctor',
  'receptionist',
  'lab_technician',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// ─── Register / Create User ─────────────────────────────────────────────────
export const CreateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(25),
  last_name: z.string().min(1, 'Last name is required').max(25),
  gender: z.enum(['Male', 'Female', 'Other']),
  email: z.string().email('Please provide a valid email id'),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  role: UserRoleSchema,
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  salary: z.number().positive('Salary must be a positive number'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ─── Sign In ────────────────────────────────────────────────────────────────
export const SignInSchema = z.object({
  email: z.string().email('Please provide a valid email id'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SignInInput = z.infer<typeof SignInSchema>;

// ─── Entities / Responses ────────────────────────────────────────────────────
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  role: UserRole;
  salary: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}
