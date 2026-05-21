import { Schema, model } from 'mongoose';
import { AppointmentStatus } from '../models/appointment.dto';

export interface AppointmentDoc {
  _id: string;
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

const AppointmentSchema = new Schema<AppointmentDoc>(
  {
    _id: { type: String, required: true },
    patient_id: { type: String, required: true },
    doctor_id: { type: String, required: true },
    scheduled_at: { type: String, required: true },
    token_number: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'arrived', 'completed', 'cancelled', 'no-show'], required: true },
    reason: { type: String, required: true },
    created_by: { type: String, required: true },
    updated_by: { type: String, required: true },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { collection: 'appointments', _id: false }
);

export const AppointmentModel = model<AppointmentDoc>('Appointment', AppointmentSchema);
