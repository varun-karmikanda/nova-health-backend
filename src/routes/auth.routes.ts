import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new system user
 *     description: Creates a new user with the specified role. Restricted to administrators.
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
 *               - gender
 *               - email
 *               - phone
 *               - role
 *               - password
 *               - salary
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Sarah
 *               last_name:
 *                 type: string
 *                 example: Connor
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Female
 *               email:
 *                 type: string
 *                 format: email
 *                 example: receptionist@novahealth.com
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, receptionist, lab_technician]
 *                 example: receptionist
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePass123
 *               salary:
 *                 type: number
 *                 example: 30000
 *     responses:
 *       201:
 *         description: User registered successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Admin role required)
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
authRouter.post('/register', authMiddleware, requireRole(['admin']), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in a user
 *     description: Authenticates user by email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: receptionist@novahealth.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     userId:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthenticated
 */
authRouter.get('/me', authMiddleware, authController.me);
authRouter.get('/doctors', authMiddleware, authController.listDoctors);

/**
 * @openapi
 * /auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: List all system users / staff members
 *     description: Returns a list of all active system users. Restricted to administrators.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Admin role required)
 */
authRouter.get('/users', authMiddleware, requireRole(['admin']), authController.listUsers);

/**
 * @openapi
 * /auth/users/{id}:
 *   delete:
 *     tags: [Auth]
 *     summary: Soft-delete/deactivate a system user
 *     description: Deactivates a system user by marking them as inactive. Restricted to administrators. Cannot delete self.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: Bad request (e.g. attempting to delete self)
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: User not found
 */
authRouter.delete('/users/:id', authMiddleware, requireRole(['admin']), authController.deleteUser);

export { authRouter };
