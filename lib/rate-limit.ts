import { env } from '@/lib/env';
import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>) => {
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
