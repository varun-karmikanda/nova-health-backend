import { Request, Response, NextFunction } from 'express';

import { PatientService } from '../services/patient.service';
import { CreatePatientSchema, UpdatePatientSchema } from '../models/patient.dto';

export class PatientController {
  private patientService = new PatientService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreatePatientSchema.parse(req.body);
      const createdBy = req.user?.email ?? 'system';
      const patient = await this.patientService.createPatient(validated, createdBy);
      res.status(201).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patients = await this.patientService.listPatients();
      res.status(200).json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Patient ID is required' },
        });
        return;
      }
      const patient = await this.patientService.getPatientById(id);
      res.status(200).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Patient ID is required' },
        });
        return;
      }
      const validated = UpdatePatientSchema.parse(req.body);
      const updatedBy = req.user?.email ?? 'system';
      const patient = await this.patientService.updatePatient(id, validated, updatedBy);
      res.status(200).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Patient ID is required' },
        });
        return;
      }
      await this.patientService.removePatient(id);
      res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
