/**
 * Server-side database access (Node runtime only — never import this from a
 * "use client" file). Backed by a hosted Postgres instance (Vercel Postgres /
 * Neon) so accounts work for every visitor, not just the one running the
 * desktop app's local server on localhost:3000.
 *
 * Connection string comes from the POSTGRES_URL env var. Vercel injects it
 * automatically once a Postgres database is attached to the project; for
 * local `next dev` you copy the same value into .env.local.
 */

import { sql } from "@vercel/postgres";

let schemaReady: Promise<void> | null = null;

/** Creates the users table on first use. Cheap to call repeatedly — the
 *  promise is cached so it only actually runs once per server instance. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          nickname TEXT NOT NULL,
          plan TEXT NOT NULL DEFAULT 'free',
          avatar TEXT,
          email_verified BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Added after the table already existed in some environments —
      // guarded ALTER so this stays a no-op once the column is there.
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false`;

      // Telegram Login Widget / Google OAuth accounts don't always come with
      // a password (Telegram never gives one) or, for Telegram, even a real
      // email (synthesized instead — see /api/auth/telegram) — so the old
      // NOT NULL on password_hash has to go. Re-running this on an already-
      // nullable column is a harmless no-op.
      await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
      // UNIQUE here doubles as the ON CONFLICT target each provider's login
      // route upserts against.
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_id TEXT UNIQUE`;

      // Real login sessions — one row per sign-in (password, Google,
      // Microsoft, Telegram) — backing the "Active sessions" list on
      // /profile and in the desktop app's settings. See
      // src/lib/server/sessions.ts.
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          user_agent TEXT,
          ip TEXT,
          revoked_at TIMESTAMPTZ
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS email_verifications (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL,
          last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      // One-time tokens that link a Telegram Stars payment back to the site
      // account that started it — see /api/payment/intent and
      // /api/admin/redeem-payment. The token travels through Telegram's
      // invoice payload instead of the email itself, so nothing PII-bearing
      // sits in a deep link or a bot log.
      await sql`
        CREATE TABLE IF NOT EXISTS payment_intents (
          token TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          plan TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          consumed_at TIMESTAMPTZ
        )
      `;

      // Small key/value store for the payment bot's own state (currently just
      // the owner's Telegram chat id) — see /api/telegram/webhook. The bot
      // used to keep this in a line of .env.local on whoever's laptop ran it;
      // now that it's a webhook on Vercel there's no local file to keep it in,
      // so it lives here instead.
      await sql`
        CREATE TABLE IF NOT EXISTS bot_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;

      // Payment-receipt screenshots people send the bot for the manual
      // (non-Stars) payment path. Replaces the old receipts.json file next to
      // bot.mjs — same reason as bot_settings above.
      await sql`
        CREATE TABLE IF NOT EXISTS bot_receipts (
          id TEXT PRIMARY KEY,
          chat_id TEXT NOT NULL,
          name TEXT,
          username TEXT,
          from_id TEXT,
          message_id BIGINT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          status TEXT NOT NULL DEFAULT 'pending',
          decided_at TIMESTAMPTZ
        )
      `;

      // A device the desktop app has actually "remembered": one row per
      // (user, device_id) the app has ever checked in with. device_id is
      // the random UUID the desktop app generates once and persists in
      // userData/device-id.json, sent as the X-Device-Id header on every
      // cloudPostApi/cloudGetApi call (see main.js's getDeviceId()). Before
      // this table, that header was sent but never read by the server —
      // nothing was actually "remembered". See src/lib/server/devices.ts
      // and /api/device/touch.
      await sql`
        CREATE TABLE IF NOT EXISTS trusted_devices (
          user_id TEXT NOT NULL,
          device_id TEXT NOT NULL,
          user_agent TEXT,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (user_id, device_id)
        )
      `;

      // Read-only audit trail of admin actions (grant/revoke plan, delete
      // users, etc) for the "who did what" console in the desktop app's
      // Site statistics panel. Write-only from the app's own admin routes —
      // there is no edit/delete on this table itself.
      await sql`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id TEXT PRIMARY KEY,
          admin_email TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return schemaReady;
}

export { sql };
