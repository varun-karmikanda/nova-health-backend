import { Appointment } from '../models/appointment.dto';

export class AppointmentRepository {
  private static appointments: Appointment[] = [];

  private static tokenCounter = 0;

  public create(appointment: Appointment): Promise<Appointment> {
    AppointmentRepository.appointments.push(appointment);
    return Promise.resolve(appointment);
  }

  public findAll(): Promise<Appointment[]> {
    return Promise.resolve(
      AppointmentRepository.appointments.filter((a) => !a.is_deleted),
    );
  }

  public findById(id: string): Promise<Appointment | null> {
    const appointment = AppointmentRepository.appointments.find(
      (a) => a.id === id && !a.is_deleted,
    );
    return Promise.resolve(appointment ?? null);
  }

  public findByPatientId(patientId: string): Promise<Appointment[]> {
    return Promise.resolve(
      AppointmentRepository.appointments.filter(
        (a) => a.patient_id === patientId && !a.is_deleted,
      ),
    );
  }

  public update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Appointment | null> {
    const index = AppointmentRepository.appointments.findIndex(
      (a) => a.id === id,
    );
    if (index === -1) return Promise.resolve(null);

    const current = AppointmentRepository.appointments[index];
    if (!current) return Promise.resolve(null);

    Object.assign(current, updates, { updated_at: new Date().toISOString() });
    return Promise.resolve(current);
  }

  public softDelete(id: string): Promise<boolean> {
    const index = AppointmentRepository.appointments.findIndex(
      (a) => a.id === id,
    );
    if (index === -1) return Promise.resolve(false);

    const current = AppointmentRepository.appointments[index];
    if (!current) return Promise.resolve(false);

    Object.assign(current, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(true);
  }

  public nextTokenNumber(): number {
    AppointmentRepository.tokenCounter += 1;
    return AppointmentRepository.tokenCounter;
  }
}
