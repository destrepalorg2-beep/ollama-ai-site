import { NextResponse } from "next/server";
import { userIdFromRequest } from "@/lib/server/jwt";
import { touchTrustedDevice } from "@/lib/server/devices";

/**
 * Called by the desktop app once it has a signed-in user and a device id
 * (see main.js's 'device-touch' IPC handler, driven from admin.html on
 * boot). This is what actually makes the X-Device-Id header — already sent
 * on every cloudPostApi/cloudGetApi call — mean something: it upserts a row
 * in trusted_devices so a returning device is recognized instead of the
 * header just being read and discarded.
 */
export async function POST(req: Request): Promise<Response> {
  const userId = userIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) {
    return NextResponse.json({ error: "Отсутствует X-Device-Id." }, { status: 400 });
  }

  const result = await touchTrustedDevice(userId, deviceId, req.headers.get("user-agent"));

  return NextResponse.json({
    ok: true,
    isNew: result.isNew,
    firstSeenAt: result.firstSeenAt,
  });
}
