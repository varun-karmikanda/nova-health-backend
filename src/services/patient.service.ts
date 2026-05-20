import { randomUUID } from 'node:crypto';

import { PatientRepository } from '../repositories/patient.repository';
import {
  CreatePatientInput,
  UpdatePatientInput,
  Patient,
} from '../models/patient.dto';
import { NotFoundError } from '../utils/errors';

export class PatientService {
  private patientRepository = new PatientRepository();

  public async createPatient(
    input: CreatePatientInput,
    createdBy: string,
  ): Promise<Patient> {
    const now = new Date().toISOString();

    const newPatient: Patient = {
      id: randomUUID(),
      first_name: input.first_name,
      last_name: input.last_name,
      dob: new Date(input.dob).toISOString(),
      gender: input.gender,
      blood_group: input.blood_group,
      phone: input.phone,
      email: input.email ?? null,
      address: input.address,
      is_active: true,
      created_by: createdBy,
      updated_by: createdBy,
      created_at: now,
      updated_at: now,
    };

    return this.patientRepository.create(newPatient);
  }

  public async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }
    return patient;
  }

  public async listPatients(): Promise<Patient[]> {
    return this.patientRepository.findAll();
  }

  public async updatePatient(
    id: string,
    input: UpdatePatientInput,
    updatedBy: string,
  ): Promise<Patient> {
    const existing = await this.patientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient', id);
    }

    const updates: Record<string, unknown> = { updated_by: updatedBy };
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    const updated = await this.patientRepository.update(id, updates);

    if (!updated) {
      throw new NotFoundError('Patient', id);
    }
    return updated;
  }

  public async removePatient(id: string): Promise<void> {
    const existing = await this.patientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient', id);
    }
    await this.patientRepository.softDelete(id);
  }
}
