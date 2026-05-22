import { Request, Response, NextFunction } from 'express';

import { AuthService } from '../services/auth.service';
import { CreateUserSchema, SignInSchema } from '../models/auth.dto';

export class AuthController {
  private authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreateUserSchema.parse(req.body);
      const operatorId = req.user?.id;
      const user = await this.authService.register(validated, operatorId);
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
      const validated = SignInSchema.parse(req.body);
      const data = await this.authService.login(validated);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Refresh token is required' },
        });
        return;
      }
      const data = await this.authService.refresh(refreshToken);
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
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
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

  public listDoctors = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctors = await this.authService.getDoctors();
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (err) {
      next(err);
    }
  };

  public listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeDeactivated = req.query.include_deactivated === 'true';
      const users = await this.authService.getAllUsers(includeDeactivated);
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const operatorId = req.user?.id;
      if (!operatorId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      if (id === operatorId) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Cannot deactivate your own administrator account' },
        });
        return;
      }

      await this.authService.removeUser(id as string, operatorId);
      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}
