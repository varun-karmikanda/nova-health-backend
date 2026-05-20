import { Patient } from '../models/patient.dto';

export class PatientRepository {
  private static patients: Patient[] = [];

  public create(patient: Patient): Promise<Patient> {
    PatientRepository.patients.push(patient);
    return Promise.resolve(patient);
  }

  public findById(id: string): Promise<Patient | null> {
    const patient = PatientRepository.patients.find(
      (p) => p.id === id && p.is_active,
    );
    return Promise.resolve(patient ?? null);
  }

  public findAll(): Promise<Patient[]> {
    return Promise.resolve(
      PatientRepository.patients.filter((p) => p.is_active),
    );
  }

  public update(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Patient | null> {
    const index = PatientRepository.patients.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(null);

    const current = PatientRepository.patients[index];
    if (!current) return Promise.resolve(null);

    Object.assign(current, updates, { updated_at: new Date().toISOString() });
    return Promise.resolve(current);
  }

  public softDelete(id: string): Promise<boolean> {
    const index = PatientRepository.patients.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(false);

    const current = PatientRepository.patients[index];
    if (!current) return Promise.resolve(false);

    Object.assign(current, {
      is_active: false,
      updated_at: new Date().toISOString(),
    });
    return Promise.resolve(true);
  }
}
