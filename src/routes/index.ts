import { Router, Request, Response } from 'express';

import { authRouter } from './auth.routes';
import { patientRouter } from './patient.routes';
import { appointmentRouter } from './appointment.routes';
import { auditRouter } from './audit.routes';
import { encounterRouter } from './encounter.routes';
import { prescriptionRouter } from './prescription.routes';
import { invoiceRouter } from './invoice.routes';

const apiRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retrieve health status of the application
 *     description: Returns the status, timestamp, and environment.
 *     responses:
 *       200:
 *         description: Application is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-20T16:40:31.863Z
 *                 env:
 *                   type: string
 *                   example: development
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  req.log.info('Health check triggered');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'development',
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/patients', patientRouter);
apiRouter.use('/appointments', appointmentRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/encounters', encounterRouter);
apiRouter.use('/prescriptions', prescriptionRouter);
apiRouter.use('/invoices', invoiceRouter);

export { apiRouter };
