import { Request, Response, NextFunction } from 'express';

import { EncounterService } from '../services/encounter.service';
import { CreateEncounterSchema, UpdateEncounterSchema } from '../models/encounter.dto';

export class EncounterController {
  private encounterService = new EncounterService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreateEncounterSchema.parse(req.body);
      const createdBy = req.user?.email ?? 'system';
      const encounter = await this.encounterService.createEncounter(validated, createdBy);
      res.status(201).json({ success: true, data: encounter });
    } catch (err) {
      next(err);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const encounters = await this.encounterService.listEncounters();
      res.status(200).json({ success: true, data: encounters });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Encounter ID is required' },
        });
        return;
      }
      const encounter = await this.encounterService.getEncounterById(id);
      res.status(200).json({ success: true, data: encounter });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Encounter ID is required' },
        });
        return;
      }
      const validated = UpdateEncounterSchema.parse(req.body);
      const updatedBy = req.user?.email ?? 'system';
      const encounter = await this.encounterService.updateEncounter(id, validated, updatedBy);
      res.status(200).json({ success: true, data: encounter });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Encounter ID is required' },
        });
        return;
      }
      await this.encounterService.removeEncounter(id);
      res.status(200).json({ success: true, message: 'Encounter deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
