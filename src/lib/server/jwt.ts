/**
 * Signs and verifies the account JWT used by the cloud auth API
 * (/api/auth/register, /api/auth/login, /api/profile). Server-side only.
 */

import jwt from "jsonwebtoken";
import { isSessionRevoked } from "@/lib/server/sessions";

const SECRET = process.env.JWT_SECRET;

// Matches SESSION_DAYS in src/lib/db.ts (the browser's own "stay signed in"
// window). They used to disagree — the JWT died at 30 days while the
// client's localStorage session claimed to be good for 90 — so a signed-in
// person could sit on a perfectly normal-looking account for two more
// months while every authenticated API call silently 401'd underneath them
// (clicking "Choose Pro", opening admin stats, etc. would suddenly demand a
// fresh login with no explanation). Keep these two numbers in sync.
//
// `sessionId`, when given, is embedded as the `sid` claim and ties this
// token to a row in the `sessions` table (see sessions.ts) — that row is
// what "Active sessions" lists and what revoking a session actually
// invalidates. Callers that don't pass one (there shouldn't be any left)
// get a token nothing can revoke early, same as before this existed.
export function signToken(userId: string, sessionId?: string): string {
  if (!SECRET) throw new Error("JWT_SECRET is not set");
  const payload: Record<string, string> = { sub: userId };
  if (sessionId) payload.sid = sessionId;
  return jwt.sign(payload, SECRET, { expiresIn: "90d" });
}

function decode(token: string): { userId: string; sessionId: string | null } | null {
  if (!SECRET) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
    if (typeof decoded.sub !== "string") return null;
    return { userId: decoded.sub, sessionId: typeof decoded.sid === "string" ? decoded.sid : null };
  } catch {
    return null;
  }
}

export function verifyToken(token: string): string | null {
  return decode(token)?.userId ?? null;
}

/** Pulls the user id out of an `Authorization: Bearer <token>` header.
 *  Signature/expiry only — does NOT check session revocation. Existing
 *  routes keep using this unchanged; use authFromRequest for anything that
 *  should actually respect "sign out this device". */
export function userIdFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return token ? verifyToken(token) : null;
}

/** Same idea as userIdFromRequest, but also rejects a token whose session
 *  was revoked from the "Active sessions" list. Tokens minted without a
 *  session id (none should exist going forward, but old ones may still be
 *  floating around in someone's browser) are never blocked this way. */
export async function authFromRequest(
  req: Request,
): Promise<{ userId: string; sessionId: string | null } | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const decoded = decode(token);
  if (!decoded) return null;
  if (decoded.sessionId && (await isSessionRevoked(decoded.sessionId))) return null;
  return decoded;
}
