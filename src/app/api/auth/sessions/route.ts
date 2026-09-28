import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/server/db";
import { authFromRequest, signToken } from "@/lib/server/jwt";
import { createSession, deviceLabel, listSessions, touchSession } from "@/lib/server/sessions";

export const runtime = "nodejs";

/**
 * Lists the signed-in account's own active sessions — one row per device
 * that's actually logged in (see sessions.ts), not per browser tab. Backs
 * the "Active sessions" panel on /profile and in the desktop app's
 * settings. Never returns another user's sessions: everything here is
 * scoped to whichever account the caller's own token belongs to.
 */
export async function GET(req: Request): Promise<Response> {
  const auth = await authFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  await ensureSchema();

  // A token issued before this feature shipped carries no session id, so it
  // has no row to show — "Active sessions" would look empty even though
  // the person is very much signed in right now. Self-heal on first visit:
  // mint a session for THIS request and hand back a freshly re-signed token
  // that carries it, so the client can silently swap its stored token and
  // every request after this one is properly tracked.
  let sessionId = auth.sessionId;
  let refreshedToken: string | undefined;
  if (!sessionId) {
    sessionId = await createSession(auth.userId, req);
    refreshedToken = signToken(auth.userId, sessionId);
  } else {
    // Visiting this page IS activity on the current session — keep its
    // "last seen" honest instead of it going stale the moment someone stops
    // clicking around.
    await touchSession(sessionId);
  }

  const rows = await listSessions(auth.userId);
  const sessions = rows.map((s) => ({
    id: s.id,
    device: deviceLabel(s.userAgent),
    ip: s.ip,
    createdAt: s.createdAt,
    lastSeenAt: s.lastSeenAt,
    isCurrent: s.id === sessionId,
  }));

  return NextResponse.json({ sessions, ...(refreshedToken ? { refreshedToken } : {}) });
}
