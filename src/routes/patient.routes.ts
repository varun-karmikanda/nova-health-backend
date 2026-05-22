import { Router } from 'express';

import { PatientController } from '../controllers/patient.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const patientRouter = Router();
const patientController = new PatientController();

/**
 * @openapi
 * /patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create patient
 *     description: Creates a new patient record. Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - dob
 *               - gender
 *               - blood_group
 *               - phone
 *               - address
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               blood_group:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: A+
 *               phone:
 *                 type: string
 *                 example: "+91 1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zip_code
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 123 Main St
 *                   city:
 *                     type: string
 *                     example: Anytown
 *                   state:
 *                     type: string
 *                     example: Anystate
 *                   zip_code:
 *                     type: string
 *                     example: "12345"
 *                   country:
 *                     type: string
 *                     example: India
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation error
 */
patientRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  patientController.create,
);

/**
 * @openapi
 * /patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients
 *     description: Returns list of active patients. Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Patients fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
patientRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist', 'lab_technician']),
  patientController.list,
);

/**
 * @openapi
 * /patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient by ID
 *     description: Returns a single patient. Roles — admin, receptionist.
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
 *         description: Patient fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient not found
 */
patientRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist', 'lab_technician']),
  patientController.getById,
);

/**
 * @openapi
 * /patients/{id}:
 *   patch:
 *     tags: [Patients]
 *     summary: Update a patient by ID
 *     description: Partially updates patient fields. Roles — admin, receptionist.
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               blood_group:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient not found
 */
patientRouter.patch(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  patientController.update,
);

/**
 * @openapi
 * /patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete a patient by ID
 *     description: Soft-deletes a patient record. Roles — admin only.
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
 *         description: Patient deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 *       404:
 *         description: Patient not found
 */
patientRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  patientController.remove,
);

export { patientRouter };
