import { Request, Response, NextFunction } from 'express';

import { AuditService } from '../services/audit.service';

export class AuditController {
  private auditService = new AuditService();

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.auditService.listAllLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };

  public getByEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      if (!entityType || !entityId) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Entity type and ID are required' },
        });
        return;
      }

      const logs = await this.auditService.getLogsByEntity(entityType, entityId);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };
}
