const buckets = new Map<string, { count: number; resetAt: number }>();

const SWEEP_INTERVAL_MS = 60_000;

let lastSweep = Date.now();

function sweep() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { allowed: boolean; remaining: number } {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count };
}

export function rateLimitResponse(remaining: number, resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    'Retry-After': String(Math.max(retryAfter, 1)),
  };
}
