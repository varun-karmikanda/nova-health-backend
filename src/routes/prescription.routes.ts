import { Router } from 'express';

import { PrescriptionController } from '../controllers/prescription.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const prescriptionRouter = Router();
const prescriptionController = new PrescriptionController();

/**
 * @openapi
 * /prescriptions:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Create a prescription
 *     description: Creates a new prescription record. Roles — admin, doctor.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encounter_id
 *               - patient_id
 *               - doctor_id
 *               - medication_items
 *             properties:
 *               encounter_id:
 *                 type: string
 *                 format: uuid
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *               medication_items:
 *                 type: array
 *                 items:
 *                   type: object
 *               instructions:
 *                 type: string
 *               refill_count:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Encounter not found
 *       422:
 *         description: Validation error
 */
prescriptionRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  prescriptionController.create,
);

/**
 * @openapi
 * /prescriptions:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get all prescriptions
 *     description: Returns list of prescriptions. Roles — admin, doctor, receptionist.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Prescriptions fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
prescriptionRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  prescriptionController.list,
);

/**
 * @openapi
 * /prescriptions/{id}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get prescription by ID
 *     description: Returns a single prescription. Roles — admin, doctor, receptionist.
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
 *         description: Prescription fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  prescriptionController.getById,
);

/**
 * @openapi
 * /prescriptions/{id}:
 *   patch:
 *     tags: [Prescriptions]
 *     summary: Update a prescription
 *     description: Updates prescription details. Roles — admin, doctor.
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
 *                 enum: [draft, signed, dispensed]
 *               medication_items:
 *                 type: array
 *                 items:
 *                   type: object
 *               instructions:
 *                 type: string
 *               refill_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.patch(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor']),
  prescriptionController.update,
);

/**
 * @openapi
 * /prescriptions/{id}:
 *   delete:
 *     tags: [Prescriptions]
 *     summary: Delete a prescription
 *     description: Soft-deletes a prescription. Roles — admin only.
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
 *         description: Prescription deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 *       404:
 *         description: Prescription not found
 */
prescriptionRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  prescriptionController.remove,
);

export { prescriptionRouter };
