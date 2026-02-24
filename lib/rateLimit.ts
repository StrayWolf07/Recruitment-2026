/**
 * In-memory rate limiter (sliding window). Suitable for single-instance deployment.
 * For multi-instance, use Redis or similar.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const AUTH_MAX = 10; // requests per window for auth
const SUBMIT_MAX = 5; // requests per window for submit

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function getOrCreate(key: string, limit: number): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  if (now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return entry;
  }
  return entry;
}

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function checkAuthRateLimit(request: Request): { ok: boolean; retryAfter?: number } {
  const key = getKey(getClientId(request), "auth");
  const entry = getOrCreate(key, AUTH_MAX);
  if (entry.count > AUTH_MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - Date.now()) / 1000) };
  }
  return { ok: true };
}

export function checkSubmitRateLimit(request: Request): { ok: boolean; retryAfter?: number } {
  const key = getKey(getClientId(request), "submit");
  const entry = getOrCreate(key, SUBMIT_MAX);
  if (entry.count > SUBMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - Date.now()) / 1000) };
  }
  return { ok: true };
}
