/**
 * Base for all application errors.
 * isOperational = true  → expected business error (4xx); log at warn level
 * isOperational = false → programmer error or unexpected state (5xx); log at error level, may need restart
 */
export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly isOperational: boolean = true,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype); // needed for instanceof checks after transpilation
    Error.captureStackTrace(this, this.constructor);
  }
}

// 4xx — operational, expected
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` '${id}'` : ''} not found`, 404, 'NOT_FOUND', true, { resource, id });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

export class ConflictError extends AppError {
  constructor(resource: string, detail?: string) {
    super(`${resource} already exists${detail ? `: ${detail}` : ''}`, 409, 'CONFLICT', true);
  }
}

export class BusinessError extends AppError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code, true);
  }
}

// 5xx — non-operational, unexpected
export class ExternalServiceError extends AppError {
  constructor(service: string, cause?: Error) {
    super(`External service '${service}' failed`, 502, 'EXTERNAL_SERVICE_ERROR', false, {
      service,
    });
    if (cause) this.stack += `\nCaused by: ${cause.stack ?? cause.message}`;
  }
}
