import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '@prisma/client';

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      throw new ApiError(401, 'Sign in to continue.', 'UNAUTHENTICATED');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      throw new ApiError(401, 'Your library account is not set up yet. Sign out and sign in again, or contact the library.', 'ACCOUNT_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your library account is inactive. Contact the library to restore access.', 'ACCOUNT_INACTIVE');
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
  } catch {
    // Optional authentication: an invalid or expired token is treated as anonymous.
    next();
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Sign in to continue.', 'UNAUTHENTICATED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have access to this area.', 'FORBIDDEN', { requiredRoles: allowedRoles }));
    }

    next();
  };
}
