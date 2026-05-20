import { Encounter } from '../models/encounter.dto';

export class EncounterRepository {
  private static encounters: Encounter[] = [];

  public create(encounter: Encounter): Promise<Encounter> {
    EncounterRepository.encounters.push(encounter);
    return Promise.resolve(encounter);
  }

  public findAll(): Promise<Encounter[]> {
    return Promise.resolve(EncounterRepository.encounters.filter((e) => !e.is_deleted));
  }

  public findById(id: string): Promise<Encounter | null> {
    const encounter = EncounterRepository.encounters.find(
      (e) => e.id === id && !e.is_deleted,
    );
    return Promise.resolve(encounter ?? null);
  }

  public findByPatientId(patientId: string): Promise<Encounter[]> {
    return Promise.resolve(
      EncounterRepository.encounters.filter(
        (e) => e.patient_id === patientId && !e.is_deleted,
      ),
    );
  }

  public update(id: string, updates: Record<string, unknown>): Promise<Encounter | null> {
    const index = EncounterRepository.encounters.findIndex((e) => e.id === id);
    if (index === -1) return Promise.resolve(null);

    const current = EncounterRepository.encounters[index];
    if (!current) return Promise.resolve(null);

    Object.assign(current, updates, { updated_at: new Date().toISOString() });
    return Promise.resolve(current);
  }

  public softDelete(id: string): Promise<boolean> {
    const index = EncounterRepository.encounters.findIndex((e) => e.id === id);
    if (index === -1) return Promise.resolve(false);

    const current = EncounterRepository.encounters[index];
    if (!current) return Promise.resolve(false);

    Object.assign(current, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(true);
  }
}
