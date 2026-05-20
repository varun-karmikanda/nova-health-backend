import { Router } from 'express';

import { PatientController } from '../controllers/patient.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const patientRouter = Router();
const patientController = new PatientController();

/**
 * @openapi
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     description: Creates a new patient record. Authorized for admins and receptionists only.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - dob
 *               - gender
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
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
 *               phone:
 *                 type: string
 *                 example: "+15550199"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       201:
 *         description: Patient record registered successfully
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
 *                       example: pat_1a2b3c
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     dob:
 *                       type: string
 *                       format: date-time
 *                     gender:
 *                       type: string
 *                       example: male
 *                     phone:
 *                       type: string
 *                       example: "+15550199"
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Unauthorized (only Admin and Receptionist can create)
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
 *     summary: Retrieve list of all patients
 *     description: Returns a list of patient records. Authorized for admin, doctor, receptionist, and labtechnician roles.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients successfully retrieved
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
 *                         example: pat_1a2b3c
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       dob:
 *                         type: string
 *                       gender:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
patientRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist', 'labtechnician']),
  patientController.list,
);

/**
 * @openapi
 * /patients/{id}:
 *   get:
 *     summary: Retrieve patient details by ID
 *     description: Returns details of a specific patient. Authorized for admin, doctor, receptionist, and labtechnician roles.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique identifier of the patient
 *         schema:
 *           type: string
 *           example: pat_1a2b3c
 *     responses:
 *       200:
 *         description: Patient record retrieved successfully
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
 *                       example: pat_1a2b3c
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dob:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient record not found
 */
patientRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist', 'labtechnician']),
  patientController.getById,
);

export { patientRouter };
