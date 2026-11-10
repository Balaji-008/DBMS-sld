import type { Request, Response, NextFunction } from 'express';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const bad = (m: string): never => { throw new HttpError(400,m); };
export const notFound = (m = 'Not found'): never => { throw new HttpError(404,m); };
export const conflict = (m: string): never => { throw new HttpError(409,m); };
export function oracleError(e: unknown): never {
  const code = (e as { errorNum?: number })?.errorNum;
  if (code === 1 || code === 2290 || code === 2291) throw new HttpError(409,'This record conflicts with an existing record or valid database constraint.');
  throw e;
}
export function errorHandler(e: unknown, _req: Request, res: Response, _next: NextFunction) {
  const code = (e as { errorNum?: number })?.errorNum;
  const err = e instanceof HttpError ? e : (code === 1 || code === 2290 || code === 2291) ? new HttpError(409,'This record conflicts with an existing record or valid database constraint.') : code === 1722 ? new HttpError(400,'Invalid numeric identifier.') : code === 1841 || code === 1861 ? new HttpError(400,'Invalid date value.') : undefined;
  if (!err) console.error('Request failed:', e instanceof Error ? e.message : 'unknown error');
  res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal server error' });
}
