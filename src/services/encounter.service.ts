import { randomUUID } from 'node:crypto';

import { EncounterRepository } from '../repositories/encounter.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateEncounterInput, UpdateEncounterInput, Encounter } from '../models/encounter.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

import { AuditService } from './audit.service';

export class EncounterService {
  private encounterRepository = new EncounterRepository();

  private appointmentRepository = new AppointmentRepository();

  private auditService = new AuditService();

  public async createEncounter(input: CreateEncounterInput, createdBy: string): Promise<Encounter> {
    const appointment = await this.appointmentRepository.findById(input.appointment_id);
    if (!appointment) {
      throw new NotFoundError('Appointment', input.appointment_id);
    }
    if (appointment.patient_id !== input.patient_id || appointment.doctor_id !== input.doctor_id) {
      throw new ValidationError('Appointment IDs do not match patient or doctor', {});
    }

    const now = new Date().toISOString();
    const newEncounter: Encounter = {
      id: randomUUID(),
      appointment_id: input.appointment_id,
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      encounter_date: new Date(input.encounter_date).toISOString(),
      symptoms: input.symptoms,
      vitals: input.vitals ?? null,
      diagnoses: input.diagnoses ?? [],
      treatment_plan: input.treatment_plan ?? null,
      notes: input.notes ?? null,
      attachments: input.attachments ?? [],
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };

    const created = await this.encounterRepository.create(newEncounter);

    await this.auditService.logAction(
      'CREATE',
      'Encounter',
      created.id,
      createdBy,
      undefined,
      null,
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  public async getEncounterById(id: string): Promise<Encounter> {
    const encounter = await this.encounterRepository.findById(id);
    if (!encounter) {
      throw new NotFoundError('Encounter', id);
    }
    return encounter;
  }

  public async listEncounters(): Promise<Encounter[]> {
    return this.encounterRepository.findAll();
  }

  public async updateEncounter(
    id: string,
    input: UpdateEncounterInput,
    updatedBy: string,
  ): Promise<Encounter> {
    const existing = await this.encounterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Encounter', id);
    }

    const updates: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    const updated = await this.encounterRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Encounter', id);
    }

    await this.auditService.logAction(
      'UPDATE',
      'Encounter',
      id,
      updatedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      updates,
    );

    return updated;
  }

  public async removeEncounter(id: string, removedBy: string): Promise<void> {
    const existing = await this.encounterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Encounter', id);
    }
    await this.encounterRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'Encounter',
      id,
      removedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
