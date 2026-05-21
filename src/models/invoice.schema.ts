import { Schema, model } from 'mongoose';
import { InvoiceStatus } from '../models/invoice.dto';

export interface InvoiceDoc {
  _id: string;
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

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    _id: { type: String, required: true },
    patient_id: { type: String, required: true },
    appointment_id: { type: String, required: true },
    total_amount: { type: Number, required: true },
    tax_amount: { type: Number, default: 0 },
    paid_amount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'], default: 'draft' },
    due_date: { type: String, required: true },
    items: { type: [Schema.Types.Mixed], required: true } as any,
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { collection: 'invoices', _id: false },
);

export const InvoiceModel = model<InvoiceDoc>('Invoice', InvoiceSchema);
