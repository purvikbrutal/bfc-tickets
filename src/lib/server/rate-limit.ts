type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const requestCounts = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for") ??
    "unknown";

  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of requestCounts.entries()) {
    if (entry.resetAt <= now) {
      requestCounts.delete(key);
    }
  }
}

export function getRateLimitResult(request: Request, scope: string): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const key = `${scope}:${getClientIp(request)}`;
  const current = requestCounts.get(key);

  if (!current || current.resetAt <= now) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  requestCounts.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
