/**
 * Best-effort in-memory rate limiter for serverless route handlers.
 *
 * Vercel can spin up several instances of the same function, and each one
 * keeps its own copy of `hits`, so this does not give a hard global cap the
 * way a shared store (Redis, etc.) would. It still meaningfully slows down a
 * single-IP brute force against one warm instance, which is enough for a
 * small personal project — an attacker distributing requests across many
 * cold instances is a problem a hosted rate limiter would be needed for.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0]!.trim() : "unknown";
}
