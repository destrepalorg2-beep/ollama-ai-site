import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/server/db";
import { authFromRequest } from "@/lib/server/jwt";
import { revokeSession } from "@/lib/server/sessions";

export const runtime = "nodejs";

/**
 * Signs out one specific device/session without touching any other one —
 * "sign out this device" from the Active sessions list. Revoking the
 * session you're currently reading this from is allowed (it's the same as
 * an ordinary sign-out, just from the list instead of the menu); the next
 * request made with that token gets rejected by authFromRequest().
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await authFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.id || "").trim();
  if (!sessionId) {
    return NextResponse.json({ error: "id обязателен." }, { status: 400 });
  }

  await ensureSchema();
  const ok = await revokeSession(auth.userId, sessionId);
  if (!ok) {
    return NextResponse.json({ error: "Сессия не найдена." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, wasCurrent: sessionId === auth.sessionId });
}
