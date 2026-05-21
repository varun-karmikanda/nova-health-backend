import { AppointmentModel } from '../models/appointment.schema';
import { Appointment } from '../models/appointment.dto';

export class AppointmentRepository {
  public async create(appointment: Appointment): Promise<Appointment> {
    const created = await AppointmentModel.create({
      _id: appointment.id,
      ...appointment,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ is_deleted: false }).lean();
    return appointments.map((a) => {
      const { _id, ...rest } = a;
      return { id: _id, ...rest } as any;
    });
  }

  public async findById(id: string): Promise<Appointment | null> {
    const appointment = await AppointmentModel.findOne({ _id: id, is_deleted: false }).lean();
    if (!appointment) return null;
    const { _id, ...rest } = appointment;
    return { id: _id, ...rest } as any;
  }

  public async findByPatientId(patientId: string): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ patient_id: patientId, is_deleted: false }).lean();
    return appointments.map((a) => {
      const { _id, ...rest } = a;
      return { id: _id, ...rest } as any;
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
    return { id: _id, ...rest } as any;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await AppointmentModel.updateOne(
      { _id: id },
      { is_deleted: true, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }

  public async nextTokenNumber(): Promise<number> {
    const count = await AppointmentModel.countDocuments();
    return count + 1;
  }
}
