import { Appointment } from '../models/appointment.dto';

export class AppointmentRepository {
  private static appointments: Appointment[] = [];

  public create(appointment: Appointment): Promise<Appointment> {
    AppointmentRepository.appointments.push(appointment);
    return Promise.resolve(appointment);
  }

  public findAll(): Promise<Appointment[]> {
    return Promise.resolve([...AppointmentRepository.appointments]);
  }

  public findByPatientId(patientId: string): Promise<Appointment[]> {
    return Promise.resolve(
      AppointmentRepository.appointments.filter((a) => a.patientId === patientId),
    );
  }
}
