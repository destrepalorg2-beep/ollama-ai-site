/**
 * "Remembers" a device the desktop app checks in from. The desktop app has
 * generated and sent a per-device UUID (X-Device-Id) on every API call for
 * a while, but nothing on the server ever read it — this module and
 * /api/device/touch are what actually persist and recognize it, so a
 * returning device shows up as known instead of the header going nowhere.
 */
import { sql, ensureSchema } from "./db";

export interface TrustedDevice {
  deviceId: string;
  userAgent: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface TouchResult {
  isNew: boolean;
  firstSeenAt: string;
}

/** Records that `deviceId` just made an authenticated request for `userId`.
 *  Returns whether this is the first time this exact (user, device) pair
 *  has been seen, and when it was first seen (now, if it's new). */
export async function touchTrustedDevice(
  userId: string,
  deviceId: string,
  userAgent: string | null
): Promise<TouchResult> {
  await ensureSchema();

  const existing = await sql`
    SELECT first_seen_at FROM trusted_devices
    WHERE user_id = ${userId} AND device_id = ${deviceId}
  `;
  const row = existing.rows[0] as { first_seen_at: string } | undefined;

  if (row) {
    await sql`
      UPDATE trusted_devices
      SET last_seen_at = now(), user_agent = ${userAgent}
      WHERE user_id = ${userId} AND device_id = ${deviceId}
    `;
    return { isNew: false, firstSeenAt: row.first_seen_at };
  }

  await sql`
    INSERT INTO trusted_devices (user_id, device_id, user_agent)
    VALUES (${userId}, ${deviceId}, ${userAgent})
  `;
  return { isNew: true, firstSeenAt: new Date().toISOString() };
}

/** All devices ever remembered for a user, most recently seen first — for a
 *  future "your devices" list (mirrors listSessions' shape/intent). */
export async function listTrustedDevices(userId: string): Promise<TrustedDevice[]> {
  await ensureSchema();
  const result = await sql`
    SELECT device_id, user_agent, first_seen_at, last_seen_at
    FROM trusted_devices
    WHERE user_id = ${userId}
    ORDER BY last_seen_at DESC
  `;
  return result.rows.map((r) => ({
    deviceId: r.device_id as string,
    userAgent: (r.user_agent as string | null) ?? null,
    firstSeenAt: r.first_seen_at as string,
    lastSeenAt: r.last_seen_at as string,
  }));
}
