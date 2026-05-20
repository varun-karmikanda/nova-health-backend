import { Request, Response, NextFunction } from 'express';

import { UserRole } from '../models/auth.dto';

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

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as {
      id: string;
      email: string;
      role: UserRole;
    };

    if (!payload.id || !payload.email || !payload.role) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token structure' },
      });
      return;
    }

    req.user = payload;
    next();
  } catch (_err) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token' },
    });
  }
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
