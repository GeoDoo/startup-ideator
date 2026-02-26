import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { allowed: boolean; retryAfterMs: number };

const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedisLimiter(windowMs: number, maxRequests: number): Ratelimit {
  const cacheKey = `${windowMs}:${maxRequests}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    if (!redis) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: "rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback (local dev / single-instance) ──

interface WindowEntry {
  timestamps: number[];
}

const windows = new Map<string, WindowEntry>();
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of windows) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) windows.delete(key);
  }
}

function memoryRateLimit(
  key: string,
  opts: { windowMs: number; maxRequests: number }
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  cleanup(opts.windowMs);

  let entry = windows.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    windows.set(key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= opts.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + opts.windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

// ── Public API ──

export async function rateLimit(
  key: string,
  opts: { windowMs: number; maxRequests: number }
): Promise<RateLimitResult> {
  if (!useRedis) {
    return memoryRateLimit(key, opts);
  }

  const limiter = getRedisLimiter(opts.windowMs, opts.maxRequests);
  const { success, reset } = await limiter.limit(key);
  if (success) {
    return { allowed: true, retryAfterMs: 0 };
  }
  const retryAfterMs = Math.max(reset - Date.now(), 0);
  return { allowed: false, retryAfterMs };
}
