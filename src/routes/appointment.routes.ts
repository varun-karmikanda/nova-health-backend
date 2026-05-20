import { Router } from 'express';

import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const appointmentRouter = Router();
const appointmentController = new AppointmentController();

/**
 * @openapi
 * /appointments:
 *   post:
 *     summary: Book a new appointment
 *     description: Schedules a patient appointment with a specific doctor. Authorized for admin and receptionist roles only.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - scheduledAt
 *               - durationMinutes
 *               - reason
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: pat_1a2b3c
 *               doctorId:
 *                 type: string
 *                 example: doc_4d5e6f
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T10:00:00.000Z"
 *               durationMinutes:
 *                 type: integer
 *                 example: 30
 *               reason:
 *                 type: string
 *                 example: Annual physical examination
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: app_7g8h9i
 *                     patientId:
 *                       type: string
 *                       example: pat_1a2b3c
 *                     doctorId:
 *                       type: string
 *                       example: doc_4d5e6f
 *                     scheduledAt:
 *                       type: string
 *                       format: date-time
 *                     durationMinutes:
 *                       type: integer
 *                     reason:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: scheduled
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request / Patient or Doctor validation errors
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin and receptionist are allowed)
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
 *     summary: Retrieve list of scheduled appointments
 *     description: Returns all appointments registered in the system. Authorized for admin, doctor, and receptionist roles only.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: app_7g8h9i
 *                       patientId:
 *                         type: string
 *                       doctorId:
 *                         type: string
 *                       scheduledAt:
 *                         type: string
 *                       durationMinutes:
 *                         type: integer
 *                       reason:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
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

export { appointmentRouter };
