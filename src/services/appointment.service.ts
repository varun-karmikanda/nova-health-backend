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

class SequencerLock {
  private static queues = new Map<string, Promise<unknown>>();

  public static async acquire<T>(dateStr: string, fn: () => Promise<T>): Promise<T> {
    const currentQueue = this.queues.get(dateStr) ?? Promise.resolve();
    const nextQueue = currentQueue.then(() => fn());
    this.queues.set(dateStr, nextQueue.catch(() => {}));
    return nextQueue;
  }
}

function getLocalDateString(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function lockDates<T>(dateA: string, dateB: string, fn: () => Promise<T>): Promise<T> {
  if (dateA === dateB) {
    return SequencerLock.acquire(dateA, fn);
  }
  const sorted = [dateA, dateB].sort();
  const date0 = sorted[0];
  const date1 = sorted[1];
  if (!date0 || !date1) {
    return fn();
  }
  return SequencerLock.acquire(date0, () => SequencerLock.acquire(date1, fn));
}

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

    const scheduledDateStr = getLocalDateString(input.scheduled_at);

    return SequencerLock.acquire(scheduledDateStr, async () => {
      const now = new Date().toISOString();
      const tokenNumber = await this.appointmentRepository.nextTokenNumber(scheduledDateStr);

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

      // Resequence the queue chronologically to assign final tokens starting at 1
      await this.appointmentRepository.resequenceTokensForDay(scheduledDateStr);

      // Fetch the updated appointment
      const finalAppointment = await this.appointmentRepository.findById(created.id);
      if (!finalAppointment) {
        throw new NotFoundError('Appointment', created.id);
      }

      await this.auditService.logAction(
        'CREATE',
        'Appointment',
        finalAppointment.id,
        createdBy,
        undefined,
        null,
        finalAppointment as unknown as Record<string, unknown>,
      );

      return finalAppointment;
    });
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

    const oldDateStr = getLocalDateString(existing.scheduled_at);
    const newDateStr = input.scheduled_at ? getLocalDateString(input.scheduled_at) : oldDateStr;

    return lockDates(oldDateStr, newDateStr, async () => {
      const updates: Record<string, unknown> = { updated_by: updatedBy };
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          updates[key] = value;
        }
      });

      if (input.scheduled_at) {
        updates.scheduled_at = new Date(input.scheduled_at).toISOString();
      }

      const updated = await this.appointmentRepository.update(id, updates);
      if (!updated) {
        throw new NotFoundError('Appointment', id);
      }

      // Resequence the day(s)
      await this.appointmentRepository.resequenceTokensForDay(oldDateStr);
      if (oldDateStr !== newDateStr) {
        await this.appointmentRepository.resequenceTokensForDay(newDateStr);
      }

      // Fetch the finalized appointment
      const finalAppointment = await this.appointmentRepository.findById(id);
      if (!finalAppointment) {
        throw new NotFoundError('Appointment', id);
      }

      await this.auditService.logAction(
        'UPDATE',
        'Appointment',
        id,
        updatedBy,
        undefined,
        existing as unknown as Record<string, unknown>,
        finalAppointment as unknown as Record<string, unknown>,
        updates,
      );

      return finalAppointment;
    });
  }

  public async cancelAppointment(id: string, cancelledBy: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }
    const dateStr = getLocalDateString(existing.scheduled_at);

    await SequencerLock.acquire(dateStr, async () => {
      await this.appointmentRepository.softDelete(id);
      await this.appointmentRepository.resequenceTokensForDay(dateStr);
    });

    await this.auditService.logAction(
      'DELETE',
      'Appointment',
      id,
      cancelledBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
