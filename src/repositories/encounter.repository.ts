import { EncounterModel } from '../models/encounter.schema';
import { Encounter } from '../models/encounter.dto';

export class EncounterRepository {
  public async create(encounter: Encounter): Promise<Encounter> {
    const created = await EncounterModel.create({
      _id: encounter.id,
      ...encounter,
    } as any);
    const { _id, ...rest } = created.toObject();
    return { id: _id, ...rest } as any;
  }

  public async findAll(): Promise<Encounter[]> {
    const encounters = await EncounterModel.find({ is_deleted: false }).lean();
    return encounters.map((e) => {
      const { _id, ...rest } = e;
      return { id: _id, ...rest } as any;
    });
  }

  public async findById(id: string): Promise<Encounter | null> {
    const encounter = await EncounterModel.findOne({ _id: id, is_deleted: false }).lean();
    if (!encounter) return null;
    const { _id, ...rest } = encounter;
    return { id: _id, ...rest } as any;
  }

  public async findByPatientId(patientId: string): Promise<Encounter[]> {
    const encounters = await EncounterModel.find({ patient_id: patientId, is_deleted: false }).lean();
    return encounters.map((e) => {
      const { _id, ...rest } = e;
      return { id: _id, ...rest } as any;
    });
  }

  public async update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Encounter | null> {
    const updated = await EncounterModel.findOneAndUpdate(
      { _id: id },
      { ...updates, updated_at: new Date().toISOString() },
      { new: true },
    ).lean();
    if (!updated) return null;
    const { _id, ...rest } = updated;
    return { id: _id, ...rest } as any;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await EncounterModel.updateOne(
      { _id: id },
      { is_deleted: true, updated_at: new Date().toISOString() },
    );
    return result.modifiedCount > 0;
  }
}
