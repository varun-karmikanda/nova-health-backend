import { PatientRepository } from '../repositories/patient.repository';
import { CreatePatientInput, Patient } from '../models/patient.dto';
import { NotFoundError } from '../utils/errors';

export class PatientService {
  private patientRepository = new PatientRepository();

  public async createPatient(input: CreatePatientInput): Promise<Patient> {
    const newPatient: Patient = {
      id: `pat_${Math.random().toString(36).substring(2, 11)}`,
      firstName: input.firstName,
      lastName: input.lastName,
      dob: new Date(input.dob).toISOString(),
      gender: input.gender,
      phone: input.phone,
      email: input.email ?? null,
      createdAt: new Date().toISOString(),
    };

    return this.patientRepository.create(newPatient);
  }

  public async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }
    return patient;
  }

  public async listPatients(): Promise<Patient[]> {
    return this.patientRepository.findAll();
  }
}
