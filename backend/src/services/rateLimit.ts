import redisClient from './redis';
import { REPORTS_PER_DAY } from '../utils/constants';
import { RateLimitInfo } from '../types';

export async function checkRateLimit(deviceFingerprint: string): Promise<RateLimitInfo> {
  const today = new Date().toISOString().split('T')[0];
  const key = `ratelimit:${deviceFingerprint}:${today}`;

  const count = await redisClient.get(key);
  const currentCount = count ? parseInt(count, 10) : 0;

  // Calculate reset time (midnight tonight)
  const resetAt = new Date();
  resetAt.setHours(24, 0, 0, 0);

  return {
    remaining: Math.max(0, REPORTS_PER_DAY - currentCount),
    resetAt,
  };
}

export async function incrementRateLimit(deviceFingerprint: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `ratelimit:${deviceFingerprint}:${today}`;

  const count = await redisClient.incr(key);

  // Set expiry to end of day if this is the first increment
  if (count === 1) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(24, 0, 0, 0);
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    await redisClient.expire(key, secondsUntilEndOfDay);
  }
}

export async function isRateLimited(deviceFingerprint: string): Promise<boolean> {
  const info = await checkRateLimit(deviceFingerprint);
  return info.remaining <= 0;
}
