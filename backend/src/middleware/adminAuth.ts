import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'andle';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''; // Will be set in env

export interface AdminAuthRequest extends Request {
  adminUsername?: string;
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false;
  }

  // Use bcrypt hash from environment variable
  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH not set in environment');
    return false;
  }

  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

export function generateAdminToken(username: string): string {
  return jwt.sign(
    { username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyAdminToken(req: AdminAuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminUsername = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
}
