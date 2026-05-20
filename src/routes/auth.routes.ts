import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new system user
 *     description: Creates a new user with the specified role.
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
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
authRouter.post('/register', authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in a user
 *     description: Authenticates user by email, password, and role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: receptionist@novahealth.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePass123
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, receptionist, lab_technician]
 *                 example: receptionist
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

export { authRouter };
