import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Normalize Zod validation errors into our error format
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message,
        requestId: req.id,
        fields: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  if (err instanceof AppError) {
    // Operational errors — expected, warn-level
    if (err.isOperational) {
      logger.warn({ err, requestId: req.id, context: err.context }, err.message);
    } else {
      // Non-operational — unexpected, may need attention
      logger.error({ err, requestId: req.id }, 'Non-operational error');
    }

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.id,
        ...(process.env.NODE_ENV !== 'production' && { context: err.context }),
      },
    });
  }

  // Completely unexpected error — hide internals from client
  logger.error({ err, requestId: req.id }, 'Unhandled error');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id,
    },
  });
};
