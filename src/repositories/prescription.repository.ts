import { PrescriptionModel } from '../models/prescription.schema';
import { Prescription } from '../models/prescription.dto';

export class PrescriptionRepository {
  public async create(prescription: Prescription): Promise<Prescription> {
    const created = await PrescriptionModel.create({
      _id: prescription.id,
      ...prescription,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<Prescription[]> {
    const prescriptions = await PrescriptionModel.find({ is_deleted: false }).lean();
    return prescriptions.map((p) => {
      const { _id, ...rest } = p;
      return { id: _id, ...rest } as any;
    });
  }

  public async findById(id: string): Promise<Prescription | null> {
    const prescription = await PrescriptionModel.findOne({ _id: id, is_deleted: false }).lean();
    if (!prescription) return null;
    const { _id, ...rest } = prescription;
    return { id: _id, ...rest } as any;
  }

  public async findByEncounterId(encounterId: string): Promise<Prescription[]> {
    const prescriptions = await PrescriptionModel.find({ encounter_id: encounterId, is_deleted: false }).lean();
    return prescriptions.map((p) => {
      const { _id, ...rest } = p;
      return { id: _id, ...rest } as any;
    });
  }

  public async update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Prescription | null> {
    const updated = await PrescriptionModel.findOneAndUpdate(
      { _id: id },
      { ...updates, updated_at: new Date().toISOString() },
      { new: true },
    ).lean();
    if (!updated) return null;
    const { _id, ...rest } = updated;
    return { id: _id, ...rest } as any;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await PrescriptionModel.updateOne(
      { _id: id },
      { is_deleted: true, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }
}
