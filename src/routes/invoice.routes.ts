import { Router } from 'express';

import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const invoiceRouter = Router();
const invoiceController = new InvoiceController();

/**
 * @openapi
 * /invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Create an invoice
 *     description: Creates a new invoice record. Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - appointment_id
 *               - total_amount
 *               - due_date
 *               - items
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               appointment_id:
 *                 type: string
 *                 format: uuid
 *               total_amount:
 *                 type: number
 *               tax_amount:
 *                 type: number
 *               paid_amount:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Patient or Appointment not found
 *       422:
 *         description: Validation error
 */
invoiceRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  invoiceController.create,
);

/**
 * @openapi
 * /invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get all invoices
 *     description: Returns list of invoices. Roles — admin, receptionist.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 */
invoiceRouter.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  invoiceController.list,
);

/**
 * @openapi
 * /invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice by ID
 *     description: Returns a single invoice. Roles — admin, receptionist.
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
 *         description: Invoice fetched successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
invoiceRouter.get(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'doctor', 'receptionist']),
  invoiceController.getById,
);

/**
 * @openapi
 * /invoices/{id}:
 *   patch:
 *     tags: [Invoices]
 *     summary: Update an invoice
 *     description: Updates invoice details. Roles — admin, receptionist.
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
 *                 enum: [draft, issued, partially_paid, paid, overdue, cancelled]
 *               paid_amount:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
invoiceRouter.patch(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'receptionist']),
  invoiceController.update,
);

/**
 * @openapi
 * /invoices/{id}:
 *   delete:
 *     tags: [Invoices]
 *     summary: Delete an invoice
 *     description: Soft-deletes an invoice. Roles — admin only.
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
 *         description: Invoice deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (only admin)
 *       404:
 *         description: Invoice not found
 */
invoiceRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  invoiceController.remove,
);

export { invoiceRouter };
