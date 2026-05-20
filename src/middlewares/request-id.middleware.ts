import { randomUUID } from 'crypto';

import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';

import { logger } from '../config/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
    }
  }
}

export function requestId() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.id = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.log = logger.child({ requestId: req.id });
    next();
  };
}
