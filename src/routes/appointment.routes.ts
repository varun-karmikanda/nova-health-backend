import { Router } from 'express';

import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const appointmentRouter = Router();
const appointmentController = new AppointmentController();

/**
 * @openapi
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book a new appointment
 *     description: Schedules a patient appointment. Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - scheduled_at
 *               - reason
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *                 example: 987fcdeb-51a2-3e4d-b567-890123456789
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T10:00:00.000Z"
 *               reason:
 *                 type: string
 *                 example: Annual physical examination
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient or Doctor not found
 *       422:
 *         description: Validation error
 */
appointmentRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  appointmentController.book,
);

/**
 * @openapi
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments
 *     description: Returns list of active appointments. Roles — admin, doctor, receptionist.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
appointmentRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  appointmentController.list,
);

/**
 * @openapi
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     description: Returns a single appointment. Roles — admin, doctor, receptionist.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
appointmentRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  appointmentController.getById,
);

/**
 * @openapi
 * /appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment status or details
 *     description: Updates appointment fields (status, scheduled_at, reason). Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, arrived, completed, cancelled, no-show]
 *                 example: confirmed
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
appointmentRouter.patch(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  appointmentController.update,
);

/**
 * @openapi
 * /appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Cancel / delete an appointment
 *     description: Soft-deletes an appointment. Roles — admin only.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 *       404:
 *         description: Appointment not found
 */
appointmentRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  appointmentController.remove,
);

export { appointmentRouter };
