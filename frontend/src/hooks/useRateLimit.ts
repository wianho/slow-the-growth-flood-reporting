import { useState, useEffect } from 'react';

interface RateLimitInfo {
  remaining: number;
  resetAt: Date | null;
}

export function useRateLimit() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    remaining: 3,
    resetAt: null,
  });

  useEffect(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('rateLimit');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRateLimitInfo({
          remaining: parsed.remaining,
          resetAt: parsed.resetAt ? new Date(parsed.resetAt) : null,
        });
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const updateRateLimit = (remaining: number, resetAt: string) => {
    const info = {
      remaining,
      resetAt: new Date(resetAt),
    };
    setRateLimitInfo(info);
    localStorage.setItem('rateLimit', JSON.stringify({
      remaining,
      resetAt,
    }));
  };

  return { rateLimitInfo, updateRateLimit };
}
