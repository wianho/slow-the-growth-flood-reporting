import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

export interface AuthRequest extends Request {
  deviceFingerprint?: string;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { deviceFingerprint: string };
    req.deviceFingerprint = decoded.deviceFingerprint;
    next();
  } catch (error) {
    logger.error('Token verification failed', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function generateToken(deviceFingerprint: string): string {
  // @ts-ignore - JWT type issue with expiresIn
  return jwt.sign({ deviceFingerprint }, JWT_SECRET, {
    expiresIn: '24h',
  });
}
