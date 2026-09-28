/**
 * Real, server-tracked login sessions — backs the "Active sessions" list on
 * /profile and the matching panel in the desktop app's settings. A row is
 * created every time someone actually signs in (password, Google,
 * Microsoft, Telegram, or a fresh email-verification) and its id rides
 * inside that sign-in's JWT as the `sid` claim (see jwt.ts). Revoking a row
 * here is real: authFromRequest() rejects any token whose session has been
 * revoked, on top of the normal signature/expiry check.
 */

import { randomUUID } from "crypto";
import { sql } from "@/lib/server/db";

export type SessionRow = {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  userAgent: string | null;
  ip: string | null;
};

/** Turns a raw User-Agent string into something a person can recognize at a
 *  glance ("Chrome · Windows") instead of the full UA blob. Good enough for
 *  telling sessions apart — not meant to be a precise device fingerprint. */
export function deviceLabel(userAgent: string | null | undefined): string {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("aihub-desktop")) return "AI HUB (приложение)";

  let os = "Неизвестное устройство";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  let browser = "";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("chrome/") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome")) browser = "Safari";

  return browser ? `${browser} · ${os}` : os;
}

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0]!.trim() : null;
}

/** Call once, right after a sign-in succeeds. Returns the new session id —
 *  pass it straight into signToken(userId, sessionId). Caller must have
 *  already called ensureSchema(). */
export async function createSession(userId: string, req: Request): Promise<string> {
  const id = randomUUID();
  await sql`
    INSERT INTO sessions (id, user_id, user_agent, ip)
    VALUES (${id}, ${userId}, ${req.headers.get("user-agent") || null}, ${clientIp(req)})
  `;
  return id;
}

/** True if this session id was explicitly revoked. A session id that
 *  doesn't exist in the table at all (tokens minted before this feature
 *  shipped never got a row) is NOT treated as revoked — only an explicit
 *  revoke blocks the token. */
export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  const r = await sql`SELECT revoked_at FROM sessions WHERE id = ${sessionId}`;
  const row = r.rows[0] as { revoked_at: string | null } | undefined;
  return !!row?.revoked_at;
}

export async function touchSession(sessionId: string): Promise<void> {
  await sql`UPDATE sessions SET last_seen_at = now() WHERE id = ${sessionId}`;
}

export async function listSessions(userId: string): Promise<SessionRow[]> {
  const r = await sql`
    SELECT id, created_at, last_seen_at, user_agent, ip
    FROM sessions
    WHERE user_id = ${userId} AND revoked_at IS NULL
    ORDER BY last_seen_at DESC
  `;
  return r.rows.map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    lastSeenAt: row.last_seen_at as string,
    userAgent: row.user_agent as string | null,
    ip: row.ip as string | null,
  }));
}

/** Revokes a session — but only if it belongs to this user, so one account
 *  can never revoke another's. Returns false if no matching row existed. */
export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  const r = await sql`
    UPDATE sessions SET revoked_at = now()
    WHERE id = ${sessionId} AND user_id = ${userId} AND revoked_at IS NULL
    RETURNING id
  `;
  return r.rows.length > 0;
}
