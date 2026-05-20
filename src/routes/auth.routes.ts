import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new system user
 *     description: Registers a new user with the specified role. Available roles are admin, doctor, receptionist, and labtechnician.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
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
 *               name:
 *                 type: string
 *                 example: Sarah Connor
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, receptionist, labtechnician]
 *                 example: receptionist
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                       example: a1b2c3d4e
 *                     email:
 *                       type: string
 *                       example: receptionist@novahealth.com
 *                     name:
 *                       type: string
 *                       example: Sarah Connor
 *                     role:
 *                       type: string
 *                       example: receptionist
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       422:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
authRouter.post('/register', authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Authenticates a user by email and password and returns a session token.
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
 *         description: Authentication successful, token returned
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
 *                     token:
 *                       type: string
 *                       description: Mock session token to pass as Bearer header
 *                       example: eyJpZCI6ImExYjJjM2Q0ZSIsImVtYWlsIjoicmVjZXB0aW9uaXN0QG5vdmFoZWFsdGguY29tIiwicm9sZSI6InJlY2VwdGlvbmlzdCJ9
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: a1b2c3d4e
 *                         email:
 *                           type: string
 *                           example: receptionist@novahealth.com
 *                         name:
 *                           type: string
 *                           example: Sarah Connor
 *                         role:
 *                           type: string
 *                           example: receptionist
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retrieve current authenticated user profile
 *     description: Decodes the bearer token and returns the current user profile data.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile successfully retrieved
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
 *                       example: a1b2c3d4e
 *                     email:
 *                       type: string
 *                       example: receptionist@novahealth.com
 *                     name:
 *                       type: string
 *                       example: Sarah Connor
 *                     role:
 *                       type: string
 *                       example: receptionist
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthenticated / Invalid token
 */
authRouter.get('/me', authMiddleware, authController.me);

export { authRouter };
