import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import {
  adminUserQuerySchema,
  updateUserRoleSchema,
  toggleUserStatusSchema,
  syncUserSchema,
} from '../schemas/user.schema';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = adminUserQuerySchema.parse(req.query);
      const result = await userService.getUsers(query);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getCurrentUser(req.user!);
      res.json({ ok: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateUserRoleSchema.parse({
        targetUserId: req.params.id,
        ...req.body,
      });
      const result = await userService.updateRole(input, req.user!);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const input = toggleUserStatusSchema.parse({
        targetUserId: req.params.id,
        ...req.body,
      });
      const result = await userService.toggleStatus(input, req.user!);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const input = syncUserSchema.parse(req.body);
      const result = await userService.syncUser(input);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
