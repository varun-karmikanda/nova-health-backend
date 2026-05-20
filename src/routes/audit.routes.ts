import { Router } from 'express';

import { AuditController } from '../controllers/audit.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const auditRouter = Router();
const auditController = new AuditController();

/**
 * @openapi
 * /audit:
 *   get:
 *     tags: [Audit]
 *     summary: Get all audit logs
 *     description: Returns the entire history of operations, including before and after snapshots. Roles — admin only.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 */
auditRouter.get('/', authMiddleware, requireRole(['admin']), auditController.list);

/**
 * @openapi
 * /audit/{entityType}/{entityId}:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit logs for a specific entity
 *     description: Returns the operation history for a specific entity (e.g., Patient, Encounter). Roles — admin only.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: entityType
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: Patient
 *       - name: entityId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audit logs fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 */
auditRouter.get(
  '/:entityType/:entityId',
  authMiddleware,
  requireRole(['admin']),
  auditController.getByEntity,
);

export { auditRouter };
