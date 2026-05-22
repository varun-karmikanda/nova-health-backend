import { randomUUID } from 'node:crypto';

import { PrescriptionRepository } from '../repositories/prescription.repository';
import { EncounterRepository } from '../repositories/encounter.repository';
import { CreatePrescriptionInput, UpdatePrescriptionInput, Prescription } from '../models/prescription.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

import { AuditService } from './audit.service';

export class PrescriptionService {
  private prescriptionRepository = new PrescriptionRepository();

  private encounterRepository = new EncounterRepository();

  private auditService = new AuditService();

  public async createPrescription(input: CreatePrescriptionInput, createdBy: string): Promise<Prescription> {
    const encounter = await this.encounterRepository.findById(input.encounter_id);
    if (!encounter) {
      throw new NotFoundError('Encounter', input.encounter_id);
    }
    if (encounter.patient_id !== input.patient_id || encounter.doctor_id !== input.doctor_id) {
      throw new ValidationError('Encounter IDs do not match patient or doctor', {});
    }

    const now = new Date().toISOString();
    const newPrescription: Prescription = {
      id: randomUUID(),
      encounter_id: input.encounter_id,
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      medication_items: input.medication_items,
      instructions: input.instructions ?? null,
      issued_at: now,
      status: 'draft',
      signed_at: null,
      refill_count: input.refill_count,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };

    const created = await this.prescriptionRepository.create(newPrescription);

    await this.auditService.logAction(
      'CREATE',
      'Prescription',
      created.id,
      createdBy,
      undefined,
      null,
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  public async getPrescriptionById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Prescription', id);
    }
    return prescription;
  }

  public async listPrescriptions(): Promise<Prescription[]> {
    return this.prescriptionRepository.findAll();
  }

  public async updatePrescription(
    id: string,
    input: UpdatePrescriptionInput,
    updatedBy: string,
  ): Promise<Prescription> {
    const existing = await this.prescriptionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Prescription', id);
    }

    const updates: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    if (input.status === 'signed' && existing.status !== 'signed') {
      updates.signed_at = new Date().toISOString();
    }

    const updated = await this.prescriptionRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Prescription', id);
    }

    await this.auditService.logAction(
      'UPDATE',
      'Prescription',
      id,
      updatedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      updates,
    );

    return updated;
  }

  public async removePrescription(id: string, removedBy: string): Promise<void> {
    const existing = await this.prescriptionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Prescription', id);
    }
    await this.prescriptionRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'Prescription',
      id,
      removedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
