import { Request, Response, NextFunction } from 'express';

import { UserRole } from '../models/auth.dto';
import { verifyToken } from '../utils/token.utils';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication token missing' },
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload || payload.type !== 'access') {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' },
    });
    return;
  }

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource' },
      });
      return;
    }

    next();
  };
}
