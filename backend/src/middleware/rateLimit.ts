import { Response, NextFunction } from 'express';
import { isRateLimited, checkRateLimit } from '../services/rateLimit';
import { AuthRequest } from './auth';

export async function rateLimitMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.deviceFingerprint) {
    return res.status(400).json({ error: 'Device fingerprint required' });
  }

  try {
    const limited = await isRateLimited(req.deviceFingerprint);

    if (limited) {
      const info = await checkRateLimit(req.deviceFingerprint);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        resetAt: info.resetAt,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit check failed', error);
    next(); // Allow request to proceed on rate limit check failure
  }
}
