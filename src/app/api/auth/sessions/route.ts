import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/server/db";
import { authFromRequest } from "@/lib/server/jwt";
import { deviceLabel, listSessions, touchSession } from "@/lib/server/sessions";

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

  // Visiting this page IS activity on the current session — keep its
  // "last seen" honest instead of it going stale the moment someone stops
  // clicking around.
  if (auth.sessionId) await touchSession(auth.sessionId);

  const rows = await listSessions(auth.userId);
  const sessions = rows.map((s) => ({
    id: s.id,
    device: deviceLabel(s.userAgent),
    ip: s.ip,
    createdAt: s.createdAt,
    lastSeenAt: s.lastSeenAt,
    isCurrent: s.id === auth.sessionId,
  }));

  return NextResponse.json({ sessions });
}
