import { z } from 'zod';

export const INVOICE_STATUSES = [
  'draft',
  'issued',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// ─── Create ──────────────────────────────────────────────────────────────────
export const CreateInvoiceSchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid(),
  total_amount: z.number().min(0),
  tax_amount: z.number().min(0).default(0),
  paid_amount: z.number().min(0).default(0),
  due_date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Due date must be a valid ISO-8601 date string',
  }),
  items: z.array(z.record(z.unknown())).min(1, 'At least one item is required'),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

// ─── Update ──────────────────────────────────────────────────────────────────
export const UpdateInvoiceSchema = z.object({
  patient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  total_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  paid_amount: z.number().min(0).optional(),
  due_date: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Due date must be a valid ISO-8601 date string',
    })
    .optional(),
  items: z.array(z.record(z.unknown())).optional(),
});

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

// ─── Entity ──────────────────────────────────────────────────────────────────
export interface Invoice {
  id: string;
  patient_id: string;
  appointment_id: string;
  total_amount: number;
  tax_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  due_date: string;
  items: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}
