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
    })();
  }
  return schemaReady;
}

export { sql };
