import { Request, Response, NextFunction } from 'express';

import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from '../models/invoice.dto';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreateInvoiceSchema.parse(req.body);
      const createdBy = req.user?.email ?? 'system';
      const invoice = await this.invoiceService.createInvoice(validated, createdBy);
      res.status(201).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoices = await this.invoiceService.listInvoices();
      res.status(200).json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invoice ID is required' },
        });
        return;
      }
      const invoice = await this.invoiceService.getInvoiceById(id);
      res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invoice ID is required' },
        });
        return;
      }
      const validated = UpdateInvoiceSchema.parse(req.body);
      const updatedBy = req.user?.email ?? 'system';
      const invoice = await this.invoiceService.updateInvoice(id, validated, updatedBy);
      res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invoice ID is required' },
        });
        return;
      }
      const removedBy = req.user?.email ?? 'system';
      await this.invoiceService.removeInvoice(id, removedBy);
      res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
