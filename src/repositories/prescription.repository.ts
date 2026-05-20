import { Prescription } from '../models/prescription.dto';

export class PrescriptionRepository {
  private static prescriptions: Prescription[] = [];

  public create(prescription: Prescription): Promise<Prescription> {
    PrescriptionRepository.prescriptions.push(prescription);
    return Promise.resolve(prescription);
  }

  public findAll(): Promise<Prescription[]> {
    return Promise.resolve(
      PrescriptionRepository.prescriptions.filter((p) => !p.is_deleted),
    );
  }

  public findById(id: string): Promise<Prescription | null> {
    const prescription = PrescriptionRepository.prescriptions.find(
      (p) => p.id === id && !p.is_deleted,
    );
    return Promise.resolve(prescription ?? null);
  }

  public findByEncounterId(encounterId: string): Promise<Prescription[]> {
    return Promise.resolve(
      PrescriptionRepository.prescriptions.filter(
        (p) => p.encounter_id === encounterId && !p.is_deleted,
      ),
    );
  }

  public update(id: string, updates: Record<string, unknown>): Promise<Prescription | null> {
    const index = PrescriptionRepository.prescriptions.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(null);

    const current = PrescriptionRepository.prescriptions[index];
    if (!current) return Promise.resolve(null);

    Object.assign(current, updates, { updated_at: new Date().toISOString() });
    return Promise.resolve(current);
  }

  public softDelete(id: string): Promise<boolean> {
    const index = PrescriptionRepository.prescriptions.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(false);

    const current = PrescriptionRepository.prescriptions[index];
    if (!current) return Promise.resolve(false);

    Object.assign(current, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(true);
  }
}
