import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitOptions = {
  requests?: number;
  window?: `${number} ${"s" | "m" | "h" | "d"}`;
};

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = "1 m";
const DEFAULT_RATE_LIMIT_PREFIX = "bfc:ratelimit";

const rateLimitCaches = new Map<string, Map<string, number>>();
const ratelimits = new Map<string, Ratelimit>();

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for") ??
    "unknown";

  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function getRateLimitConfig(options?: RateLimitOptions) {
  return {
    requests: options?.requests ?? RATE_LIMIT_REQUESTS,
    window: options?.window ?? RATE_LIMIT_WINDOW,
  };
}

function getRatelimit(config: ReturnType<typeof getRateLimitConfig>) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!redisUrl || !redisToken) {
    throw new Error("Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }

  const cacheKey = `${config.requests}:${config.window}`;
  const ephemeralCache = rateLimitCaches.get(cacheKey) ?? new Map<string, number>();

  if (!rateLimitCaches.has(cacheKey)) {
    rateLimitCaches.set(cacheKey, ephemeralCache);
  }

  let ratelimit = ratelimits.get(cacheKey);

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: false,
      ephemeralCache,
      prefix: `${DEFAULT_RATE_LIMIT_PREFIX}:${cacheKey}`,
    });

    ratelimits.set(cacheKey, ratelimit);
  }

  return ratelimit;
}

export async function getRateLimitResult(
  request: Request,
  scope: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(options);
  const key = `${scope}:${getClientIp(request)}`;
  const result = await getRatelimit(config).limit(key);

  return {
    allowed: result.success,
    retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}
