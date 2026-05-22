import { AppointmentModel } from '../models/appointment.schema';
import { Appointment } from '../models/appointment.dto';

export class AppointmentRepository {
  public async create(appointment: Appointment): Promise<Appointment> {
    const created = await AppointmentModel.create({
      _id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      scheduled_at: appointment.scheduled_at,
      token_number: appointment.token_number,
      status: appointment.status,
      reason: appointment.reason,
      created_by: appointment.created_by,
      updated_by: appointment.updated_by,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      is_deleted: appointment.is_deleted,
    });
    const obj = created.toObject();
    const { _id, ...rest } = obj;
    return { id: _id, ...rest } as Appointment;
  }

  public async findAll(): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ is_deleted: false }).sort({ scheduled_at: 1 }).lean();
    return appointments.map((a) => {
      const { _id, ...rest } = a;
      return { id: _id, ...rest } as Appointment;
    });
  }

  public async findById(id: string): Promise<Appointment | null> {
    const appointment = await AppointmentModel.findOne({ _id: id, is_deleted: false }).lean();
    if (!appointment) return null;
    const { _id, ...rest } = appointment;
    return { id: _id, ...rest } as Appointment;
  }

  public async findByPatientId(patientId: string): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ patient_id: patientId, is_deleted: false })
      .sort({ scheduled_at: 1 })
      .lean();
    return appointments.map((a) => {
      const { _id, ...rest } = a;
      return { id: _id, ...rest } as Appointment;
    });
  }

  public async update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Appointment | null> {
    const updated = await AppointmentModel.findOneAndUpdate(
      { _id: id },
      { ...updates, updated_at: new Date().toISOString() },
      { new: true },
    ).lean();
    if (!updated) return null;
    const { _id, ...rest } = updated;
    return { id: _id, ...rest } as Appointment;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await AppointmentModel.updateOne(
      { _id: id },
      { is_deleted: true, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }

  public async nextTokenNumber(dateStr: string): Promise<number> {
    // Return next token number based on active appointments on that day
    const appointments = await AppointmentModel.find({ is_deleted: false }).lean();
    const dayAppointments = appointments.filter((a) => {
      const d = new Date(a.scheduled_at);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      return localDate === dateStr && a.status !== 'cancelled';
    });
    return dayAppointments.length + 1;
  }

  public async resequenceTokensForDay(dateStr: string): Promise<void> {
    const appointments = await AppointmentModel.find({ is_deleted: false }).lean();

    const dayAppointments = appointments
      .map((a) => {
        const { _id, ...rest } = a;
        return { id: _id, ...rest } as Appointment;
      })
      .filter((a) => {
        const d = new Date(a.scheduled_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        return localDate === dateStr;
      });

    const activeAppts = dayAppointments.filter((a) => a.status !== 'cancelled');
    const cancelledAppts = dayAppointments.filter((a) => a.status === 'cancelled');

    activeAppts.sort((a, b) => {
      const timeDiff = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      if (timeDiff !== 0) return timeDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const promises: Promise<unknown>[] = [];

    activeAppts.forEach((appt, index) => {
      const newToken = index + 1;
      if (appt.token_number !== newToken) {
        promises.push(
          AppointmentModel.updateOne(
            { _id: appt.id },
            { token_number: newToken, updated_at: new Date().toISOString() },
          ),
        );
      }
    });

    cancelledAppts.forEach((appt) => {
      if (appt.token_number !== 0) {
        promises.push(
          AppointmentModel.updateOne(
            { _id: appt.id },
            { token_number: 0, updated_at: new Date().toISOString() },
          ),
        );
      }
    });

    await Promise.all(promises);
  }
}
