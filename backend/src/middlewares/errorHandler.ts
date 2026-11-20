import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code || 'api_error',
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(422).json({
      ok: false,
      error: {
        code: 'validation_error',
        message: 'Request validation failed',
        details: error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      },
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return res.status(500).json({
    ok: false,
    error: {
      code: 'internal_server_error',
      message: 'Internal server error',
    },
  });
}
