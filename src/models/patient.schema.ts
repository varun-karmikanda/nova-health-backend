import { Schema, model } from 'mongoose';
import { Gender, BloodGroup, Address } from './patient.dto';

export interface PatientDoc {
  _id: string;
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

const AddressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const PatientSchema = new Schema<PatientDoc>(
  {
    _id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    blood_group: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    address: { type: AddressSchema, required: true },
    is_active: { type: Boolean, default: true },
    created_by: { type: String, required: true },
    updated_by: { type: String, required: true },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
  },
  { collection: 'patients', _id: false }
);

export const PatientModel = model<PatientDoc>('Patient', PatientSchema);
