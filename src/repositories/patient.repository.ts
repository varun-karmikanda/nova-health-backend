import { Patient } from '../models/patient.dto';

export class PatientRepository {
  private static patients: Patient[] = [];

  public create(patient: Patient): Promise<Patient> {
    PatientRepository.patients.push(patient);
    return Promise.resolve(patient);
  }

  public findById(id: string): Promise<Patient | null> {
    const patient = PatientRepository.patients.find((p) => p.id === id);
    return Promise.resolve(patient ?? null);
  }

  public findAll(): Promise<Patient[]> {
    return Promise.resolve([...PatientRepository.patients]);
  }
}
