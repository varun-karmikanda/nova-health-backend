import { AppointmentRepository } from '../repositories/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { UserRepository } from '../repositories/user.repository';
import { BookAppointmentInput, Appointment } from '../models/appointment.dto';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AppointmentService {
  private appointmentRepository = new AppointmentRepository();

  private patientRepository = new PatientRepository();

  private userRepository = new UserRepository();

  public async bookAppointment(input: BookAppointmentInput): Promise<Appointment> {
    // 1. Verify patient exists
    const patient = await this.patientRepository.findById(input.patientId);
    if (!patient) {
      throw new NotFoundError('Patient', input.patientId);
    }

    // 2. Verify doctor exists and is actually a doctor
    const doctor = await this.userRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor', input.doctorId);
    }
    if (doctor.role !== 'doctor') {
      throw new ValidationError(
        'Cannot book appointment: Selected user is not registered as a doctor',
        {
          doctorId: input.doctorId,
          role: doctor.role,
        },
      );
    }

    const newAppointment: Appointment = {
      id: `app_${Math.random().toString(36).substring(2, 11)}`,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: new Date(input.scheduledAt).toISOString(),
      durationMinutes: input.durationMinutes,
      reason: input.reason,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    return this.appointmentRepository.create(newAppointment);
  }

  public async listAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.findAll();
  }
}
