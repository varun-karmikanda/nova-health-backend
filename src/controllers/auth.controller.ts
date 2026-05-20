import { Request, Response, NextFunction } from 'express';

import { AuthService } from '../services/auth.service';
import { RegisterUserSchema, LoginUserSchema } from '../models/auth.dto';

export class AuthController {
  private authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = RegisterUserSchema.parse(req.body);
      const user = await this.authService.register(validated);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = LoginUserSchema.parse(req.body);
      const data = await this.authService.login(validated);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is attached by the Auth middleware
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const user = await this.authService.getCurrentUser(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };
}
