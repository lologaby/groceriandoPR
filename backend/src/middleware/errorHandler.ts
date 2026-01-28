/**
 * Middleware global de manejo de errores para Express.
 */

import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[API Error]', err);

  const status = (err as { status?: number })?.status ?? 500;
  const message = (err as { message?: string })?.message ?? 'Error interno del servidor';

  res.status(typeof status === 'number' ? status : 500).json({
    error: message,
  });
}
