import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMITS } from './constants';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiters for different tiers
const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.free.requests, `${RATE_LIMITS.free.window}s`),
    analytics: true,
    prefix: '@ratelimit/free',
  }),
  starter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.starter.requests, `${RATE_LIMITS.starter.window}s`),
    analytics: true,
    prefix: '@ratelimit/starter',
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.pro.requests, `${RATE_LIMITS.pro.window}s`),
    analytics: true,
    prefix: '@ratelimit/pro',
  }),
  creator: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.creator.requests, `${RATE_LIMITS.creator.window}s`),
    analytics: true,
    prefix: '@ratelimit/creator',
  }),
};

export async function checkRateLimit(
  identifier: string,
  tier: 'free' | 'starter' | 'creator' | 'pro'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[tier];

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return { success, limit, remaining, reset };
}

export { redis };
