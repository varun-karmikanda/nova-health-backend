import { Schema, model } from 'mongoose';
import { PrescriptionStatus } from '../models/prescription.dto';

export interface PrescriptionDoc {
  _id: string;
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

const PrescriptionSchema = new Schema<PrescriptionDoc>(
  {
    _id: { type: String, required: true },
    encounter_id: { type: String, required: true },
    patient_id: { type: String, required: true },
    doctor_id: { type: String, required: true },
    medication_items: { type: [Schema.Types.Mixed], required: true } as any,
    instructions: { type: String, default: null },
    issued_at: { type: String, required: true },
    status: { type: String, enum: ['draft', 'signed', 'dispensed'], default: 'draft' },
    signed_at: { type: String, default: null },
    refill_count: { type: Number, default: 0 },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { collection: 'prescriptions', _id: false }
);

export const PrescriptionModel = model<PrescriptionDoc>('Prescription', PrescriptionSchema);
