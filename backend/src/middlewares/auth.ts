import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '@prisma/client';

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      throw new ApiError(401, 'Unauthorized: Missing or invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      throw new ApiError(401, 'Unauthorized: User account not found in database');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Forbidden: User account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized: User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Forbidden: Requires one of roles: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}
