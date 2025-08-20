import { Redis } from '@upstash/redis';

type RedisLike = Pick<Redis, 'get'|'set'|'incr'|'expire'|'del'>;

let _client: Redis | null | undefined;

function noop(): RedisLike {
  return {
    async get() { return null; },
    async set() { return 'OK' as any; },
    async incr() { return 0 as any; },
    async expire() { return 0 as any; },
    async del() { return 0 as any; },
  } as any;
}

export function getRedis(): RedisLike | null {
  if (_client === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    _client = (url && token) ? new Redis({ url, token }) : null;
  }
  return _client ?? null;
}

export function getRedisOrNoop(): RedisLike {
  return getRedis() ?? noop();
}
