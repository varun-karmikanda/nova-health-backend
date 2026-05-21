import { randomUUID } from 'node:crypto';

import { PatientRepository } from '../repositories/patient.repository';
import {
  CreatePatientInput,
  UpdatePatientInput,
  Patient,
} from '../models/patient.dto';
import { NotFoundError, ConflictError } from '../utils/errors';

import { AuditService } from './audit.service';

export class PatientService {
  private patientRepository = new PatientRepository();

  private auditService = new AuditService();

  public async createPatient(
    input: CreatePatientInput,
    createdBy: string,
  ): Promise<Patient> {
    const existing = await this.patientRepository.findByNameAndPhone(
      input.first_name,
      input.last_name,
      input.phone,
    );
    if (existing) {
      throw new ConflictError(
        'Patient',
        'with this first name, last name, and phone number already exists',
      );
    }

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
      address: input.address ?? {},
      is_active: true,
      created_by: createdBy,
      updated_by: createdBy,
      created_at: now,
      updated_at: now,
    };

    const created = await this.patientRepository.create(newPatient);

    await this.auditService.logAction(
      'CREATE',
      'Patient',
      created.id,
      createdBy !== 'system' ? undefined : undefined, // We don't have user id here easily, but let's pass undefined
      undefined,
      null,
      created as unknown as Record<string, unknown>,
    );

    return created;
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

    const updatedFirstName = input.first_name !== undefined ? input.first_name : existing.first_name;
    const updatedLastName = input.last_name !== undefined ? input.last_name : existing.last_name;
    const updatedPhone = input.phone !== undefined ? input.phone : existing.phone;

    if (
      input.first_name !== undefined ||
      input.last_name !== undefined ||
      input.phone !== undefined
    ) {
      const duplicate = await this.patientRepository.findByNameAndPhone(
        updatedFirstName,
        updatedLastName,
        updatedPhone,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          'Patient',
          'another patient with this first name, last name, and phone number already exists',
        );
      }
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

    await this.auditService.logAction(
      'UPDATE',
      'Patient',
      id,
      undefined,
      undefined,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      updates,
    );

    return updated;
  }

  public async removePatient(id: string): Promise<void> {
    const existing = await this.patientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Patient', id);
    }
    await this.patientRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'Patient',
      id,
      undefined,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
