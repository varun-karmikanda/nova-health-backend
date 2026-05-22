import { randomUUID } from 'node:crypto';

import { InvoiceRepository } from '../repositories/invoice.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { CreateInvoiceInput, UpdateInvoiceInput, Invoice } from '../models/invoice.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

import { AuditService } from './audit.service';

export class InvoiceService {
  private invoiceRepository = new InvoiceRepository();

  private appointmentRepository = new AppointmentRepository();

  private patientRepository = new PatientRepository();

  private auditService = new AuditService();

  public async createInvoice(input: CreateInvoiceInput, createdBy: string): Promise<Invoice> {
    const patient = await this.patientRepository.findById(input.patient_id);
    if (!patient) {
      throw new NotFoundError('Patient', input.patient_id);
    }
    const appointment = await this.appointmentRepository.findById(input.appointment_id);
    if (!appointment) {
      throw new NotFoundError('Appointment', input.appointment_id);
    }
    if (appointment.patient_id !== input.patient_id) {
      throw new ValidationError('Appointment does not belong to the patient', {});
    }

    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      id: randomUUID(),
      patient_id: input.patient_id,
      appointment_id: input.appointment_id,
      total_amount: input.total_amount,
      tax_amount: input.tax_amount,
      paid_amount: input.paid_amount,
      status: 'draft',
      due_date: new Date(input.due_date).toISOString(),
      items: input.items,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };

    const created = await this.invoiceRepository.create(newInvoice);

    await this.auditService.logAction(
      'CREATE',
      'Invoice',
      created.id,
      createdBy,
      undefined,
      null,
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  public async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }
    return invoice;
  }

  public async listInvoices(): Promise<Invoice[]> {
    return this.invoiceRepository.findAll();
  }

  public async updateInvoice(
    id: string,
    input: UpdateInvoiceInput,
    updatedBy: string,
  ): Promise<Invoice> {
    const existing = await this.invoiceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Invoice', id);
    }

    const updates: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    const updated = await this.invoiceRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Invoice', id);
    }

    await this.auditService.logAction(
      'UPDATE',
      'Invoice',
      id,
      updatedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      updates,
    );

    return updated;
  }

  public async removeInvoice(id: string, removedBy: string): Promise<void> {
    const existing = await this.invoiceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Invoice', id);
    }
    await this.invoiceRepository.softDelete(id);

    await this.auditService.logAction(
      'DELETE',
      'Invoice',
      id,
      removedBy,
      undefined,
      existing as unknown as Record<string, unknown>,
      null,
    );
  }
}
