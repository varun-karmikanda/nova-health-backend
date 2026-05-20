import { Router } from 'express';

import { EncounterController } from '../controllers/encounter.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const encounterRouter = Router();
const encounterController = new EncounterController();

/**
 * @openapi
 * /encounters:
 *   post:
 *     tags: [Encounters]
 *     summary: Create an encounter
 *     description: Creates a new encounter record for an appointment. Roles — admin, doctor.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - patient_id
 *               - doctor_id
 *               - encounter_date
 *               - symptoms
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 format: uuid
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *               encounter_date:
 *                 type: string
 *                 format: date-time
 *               symptoms:
 *                 type: string
 *               vitals:
 *                 type: object
 *               diagnoses:
 *                 type: array
 *                 items:
 *                   type: string
 *               treatment_plan:
 *                 type: string
 *               notes:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Encounter created successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       422:
 *         description: Validation error
 */
encounterRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  encounterController.create,
);

/**
 * @openapi
 * /encounters:
 *   get:
 *     tags: [Encounters]
 *     summary: Get all encounters
 *     description: Returns list of encounters. Roles — admin, doctor.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Encounters fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
encounterRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  encounterController.list,
);

/**
 * @openapi
 * /encounters/{id}:
 *   get:
 *     tags: [Encounters]
 *     summary: Get encounter by ID
 *     description: Returns a single encounter. Roles — admin, doctor.
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
 *         description: Encounter fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Encounter not found
 */
encounterRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  encounterController.getById,
);

/**
 * @openapi
 * /encounters/{id}:
 *   patch:
 *     tags: [Encounters]
 *     summary: Update an encounter
 *     description: Updates encounter details. Roles — admin, doctor.
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
 *               symptoms:
 *                 type: string
 *               vitals:
 *                 type: object
 *               diagnoses:
 *                 type: array
 *                 items:
 *                   type: string
 *               treatment_plan:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Encounter updated successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Encounter not found
 */
encounterRouter.patch(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  encounterController.update,
);

/**
 * @openapi
 * /encounters/{id}:
 *   delete:
 *     tags: [Encounters]
 *     summary: Delete an encounter
 *     description: Soft-deletes an encounter. Roles — admin only.
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
 *         description: Encounter deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 *       404:
 *         description: Encounter not found
 */
encounterRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  encounterController.remove,
);

export { encounterRouter };
