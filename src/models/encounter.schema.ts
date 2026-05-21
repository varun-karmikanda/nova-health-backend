import { Schema, model } from 'mongoose';

export interface EncounterDoc {
  _id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  encounter_date: string;
  symptoms: string;
  vitals?: Record<string, unknown> | null;
  diagnoses?: string[];
  treatment_plan?: string | null;
  notes?: string | null;
  attachments?: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

const EncounterSchema = new Schema<EncounterDoc>(
  {
    _id: { type: String, required: true },
    appointment_id: { type: String, required: true },
    patient_id: { type: String, required: true },
    doctor_id: { type: String, required: true },
    encounter_date: { type: String, required: true },
    symptoms: { type: String, required: true },
    vitals: { type: Schema.Types.Mixed, default: null },
    diagnoses: { type: [String], default: [] },
    treatment_plan: { type: String, default: null },
    notes: { type: String, default: null },
    attachments: { type: [Schema.Types.Mixed], default: [] },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { collection: 'encounters', _id: false }
);

export const EncounterModel = model<EncounterDoc>('Encounter', EncounterSchema);
