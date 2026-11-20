import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

interface MappedError {
  status: number;
  code: string;
  message: string;
}

/**
 * Prisma error codes that describe an expected, user-actionable outcome rather than a bug.
 * Unique-index races (incl. partial unique indexes on holds/loans) become 409 so clients can
 * refresh and retry; pool/connection exhaustion becomes 503 so clients back off.
 */
const PRISMA_ERROR_MAP: Record<string, MappedError> = {
  P2002: { status: 409, code: 'CONFLICT', message: 'This change conflicts with a recent update. Refresh and try again.' },
  P2034: { status: 409, code: 'CONFLICT', message: 'This change conflicts with a recent update. Refresh and try again.' },
  P2025: { status: 404, code: 'NOT_FOUND', message: 'The requested record no longer exists.' },
  P1001: { status: 503, code: 'DATABASE_UNAVAILABLE', message: 'The library database is temporarily unavailable. Try again shortly.' },
  P2024: { status: 503, code: 'DATABASE_BUSY', message: 'The library system is busy. Try again in a moment.' },
};

export function mapPrismaError(error: unknown): MappedError | undefined {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return PRISMA_ERROR_MAP[error.code];
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return PRISMA_ERROR_MAP.P1001;
  }
  return undefined;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    ok: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `No API route matches ${req.method} ${req.path}` },
  });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
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

  // Malformed JSON bodies from express.json()
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      ok: false,
      error: { code: 'invalid_json', message: 'The request body is not valid JSON.' },
    });
  }

  const mapped = mapPrismaError(error);
  if (mapped) {
    if (mapped.status >= 500) {
      console.error(JSON.stringify({ level: 'error', msg: 'database error', requestId: req.requestId, error: String(error) }));
    }
    return res.status(mapped.status).json({ ok: false, error: { code: mapped.code, message: mapped.message } });
  }

  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'unexpected error',
      requestId: req.requestId,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    }),
  );

  return res.status(500).json({
    ok: false,
    error: {
      code: 'internal_server_error',
      message: 'Something unexpected happened on our side. Try again, and contact the library if it keeps happening.',
      requestId: req.requestId,
    },
  });
}
