import { randomUUID } from 'node:crypto';

import { AppointmentRepository } from '../repositories/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { UserRepository } from '../repositories/user.repository';
import {
  BookAppointmentInput,
  UpdateAppointmentInput,
  Appointment,
} from '../models/appointment.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

import { AuditService } from './audit.service';

export class AppointmentService {
  private appointmentRepository = new AppointmentRepository();

  private auditService = new AuditService();

  private patientRepository = new PatientRepository();

  private userRepository = new UserRepository();

  public async bookAppointment(
    input: BookAppointmentInput,
    createdBy: string,
  ): Promise<Appointment> {
    // Verify patient exists
    const patient = await this.patientRepository.findById(input.patient_id);
    if (!patient) {
      throw new NotFoundError('Patient', input.patient_id);
    }

    // Verify doctor exists and has doctor role
    const doctor = await this.userRepository.findById(input.doctor_id);
    if (!doctor) {
      throw new NotFoundError('Doctor', input.doctor_id);
    }
    if (doctor.role !== 'doctor') {
      throw new ValidationError(
        'Selected user is not registered as a doctor',
        { doctor_id: input.doctor_id, role: doctor.role },
      );
    }

    const now = new Date().toISOString();
    const tokenNumber = this.appointmentRepository.nextTokenNumber();

    const newAppointment: Appointment = {
      id: randomUUID(),
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      scheduled_at: new Date(input.scheduled_at).toISOString(),
      token_number: tokenNumber,
      status: 'pending',
      reason: input.reason,
      created_by: createdBy,
      updated_by: createdBy,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };

    const created = await this.appointmentRepository.create(newAppointment);

    await this.auditService.logAction(
      'CREATE',
      'Appointment',
      created.id,
      createdBy !== 'system' ? undefined : undefined,
      undefined,
      null,
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  public async listAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.findAll();
  }

  public async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Appointment', id);
    }
    return appointment;
  }

  public async updateAppointment(
    id: string,
    input: UpdateAppointmentInput,
    updatedBy: string,
  ): Promise<Appointment> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }

    const updates: Record<string, unknown> = { updated_by: updatedBy };
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    const updated = await this.appointmentRepository.update(id, updates);

    if (!updated) {
      throw new NotFoundError('Appointment', id);
    }

    await this.auditService.logAction(
      'UPDATE',
      'Appointment',
      id,
      undefined,
      undefined,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      updates,
    );

    return updated;
  }

  public async cancelAppointment(id: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }
    await this.appointmentRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'Appointment',
      id,
      undefined,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
