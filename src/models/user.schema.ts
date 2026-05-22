import { Schema, model } from 'mongoose';

import { UserRole } from './auth.dto';

export interface UserDoc {
  _id: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  role: UserRole;
  salary: number;
  password_hash: string;
  refresh_token_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserSchema = new Schema<UserDoc>(
  {
    _id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'receptionist', 'lab_technician'],
      required: true,
    },
    salary: { type: Number, required: true },
    password_hash: { type: String, required: true },
    refresh_token_hash: { type: String },
    is_active: { type: Boolean, required: true, default: true },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
  },
  { collection: 'users', _id: false },
);

export const UserModel = model<UserDoc>('User', UserSchema);
