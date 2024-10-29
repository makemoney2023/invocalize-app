import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Duration } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

export type RateLimitConfig = {
  requests: number;
  window: Duration;
};

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      config.requests,
      config.window
    ),
  });

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset
  };
}
