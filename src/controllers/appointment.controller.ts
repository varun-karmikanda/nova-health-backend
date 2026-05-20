import { Request, Response, NextFunction } from 'express';

import { AppointmentService } from '../services/appointment.service';
import {
  BookAppointmentSchema,
  UpdateAppointmentSchema,
} from '../models/appointment.dto';

export class AppointmentController {
  private appointmentService = new AppointmentService();

  public book = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = BookAppointmentSchema.parse(req.body);
      const createdBy = req.user?.email ?? 'system';
      const appointment = await this.appointmentService.bookAppointment(
        validated,
        createdBy,
      );
      res.status(201).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  };

  public list = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const appointments = await this.appointmentService.listAppointments();
      res.status(200).json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  };

  public getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Appointment ID is required' },
        });
        return;
      }
      const appointment = await this.appointmentService.getAppointmentById(id);
      res.status(200).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Appointment ID is required' },
        });
        return;
      }
      const validated = UpdateAppointmentSchema.parse(req.body);
      const updatedBy = req.user?.email ?? 'system';
      const appointment = await this.appointmentService.updateAppointment(
        id,
        validated,
        updatedBy,
      );
      res.status(200).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Appointment ID is required' },
        });
        return;
      }
      await this.appointmentService.cancelAppointment(id);
      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
