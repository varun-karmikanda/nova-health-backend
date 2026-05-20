import { Request, Response, NextFunction } from 'express';

import { AppointmentService } from '../services/appointment.service';
import { BookAppointmentSchema } from '../models/appointment.dto';

export class AppointmentController {
  private appointmentService = new AppointmentService();

  public book = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = BookAppointmentSchema.parse(req.body);
      const appointment = await this.appointmentService.bookAppointment(validated);
      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (err) {
      next(err);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await this.appointmentService.listAppointments();
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  };
}
