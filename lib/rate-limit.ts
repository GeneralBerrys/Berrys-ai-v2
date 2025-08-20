import { env } from '@/lib/env';
import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';

export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>) => {
  const redis = getRedis();
  if (!redis) {
    throw new Error('Redis not configured');
  }
  
  return new Ratelimit({
    redis,
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, '10 s'),
    prefix: props.prefix ?? 'next-forge',
  });
};

export const { slidingWindow } = Ratelimit;

// Export the lazy Redis client for backward compatibility
export const redis = getRedis();
