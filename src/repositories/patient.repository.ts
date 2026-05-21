import { PatientModel } from '../models/patient.schema';
import { Patient } from '../models/patient.dto';

export class PatientRepository {
  public async create(patient: Patient): Promise<Patient> {
    const created = await PatientModel.create({
      _id: patient.id,
      ...patient,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findById(id: string): Promise<Patient | null> {
    const patient = await PatientModel.findOne({ _id: id, is_active: true }).lean();
    if (!patient) return null;
    const { _id, ...rest } = patient;
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<Patient[]> {
    const patients = await PatientModel.find({ is_active: true }).lean();
    return patients.map((p) => {
      const { _id, ...rest } = p;
      return { id: _id, ...rest } as any;
    });
  }

  public async update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Patient | null> {
    const updated = await PatientModel.findOneAndUpdate(
      { _id: id },
      { ...updates, updated_at: new Date().toISOString() },
      { new: true },
    ).lean();
    if (!updated) return null;
    const { _id, ...rest } = updated;
    return { id: _id, ...rest } as any;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await PatientModel.updateOne(
      { _id: id },
      { is_active: false, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }
}
