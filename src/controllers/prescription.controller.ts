import { Request, Response, NextFunction } from 'express';

import { PrescriptionService } from '../services/prescription.service';
import { CreatePrescriptionSchema, UpdatePrescriptionSchema } from '../models/prescription.dto';

export class PrescriptionController {
  private prescriptionService = new PrescriptionService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreatePrescriptionSchema.parse(req.body);
      const createdBy = req.user?.email ?? 'system';
      const prescription = await this.prescriptionService.createPrescription(validated, createdBy);
      res.status(201).json({ success: true, data: prescription });
    } catch (err) {
      next(err);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prescriptions = await this.prescriptionService.listPrescriptions();
      res.status(200).json({ success: true, data: prescriptions });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Prescription ID is required' },
        });
        return;
      }
      const prescription = await this.prescriptionService.getPrescriptionById(id);
      res.status(200).json({ success: true, data: prescription });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Prescription ID is required' },
        });
        return;
      }
      const validated = UpdatePrescriptionSchema.parse(req.body);
      const updatedBy = req.user?.email ?? 'system';
      const prescription = await this.prescriptionService.updatePrescription(id, validated, updatedBy);
      res.status(200).json({ success: true, data: prescription });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Prescription ID is required' },
        });
        return;
      }
      await this.prescriptionService.removePrescription(id);
      res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
