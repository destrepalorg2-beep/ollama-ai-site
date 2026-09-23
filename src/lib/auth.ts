"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as db from "@/lib/db";

// Same-origin: register/login/profile are now handled by this site's own
// API routes (backed by a shared cloud database), not by the visitor's own
// local ai hub server. Only the chat/session features still need
// localhost:3000 — those call it directly, they don't go through API_BASE.
export const API_BASE = "";

export type Account = {
  token: string;
  email: string | null;
  nickname: string | null;
  plan: string | null;
};

export function getAccount(): Account | null {
  const s = db.read().session;
  return s ? { token: s.token, email: s.email, nickname: s.nickname, plan: s.plan } : null;
}

export function signOut() {
  db.write({ session: null, pending: null });
}

/** Remember a registration that still needs its email code confirmed. */
export function setPending(p: db.Pending) {
  db.write({ pending: p });
}

export function getPending(): db.Pending | null {
  return db.read().pending;
}

/** Store the session after a successful sign-in or registration. */
export function completeSignIn(
  token: string,
  extra?: { email?: string; nickname?: string; plan?: string },
) {
  const cur = db.read();
  const prev = cur.session;
  const pend = cur.pending;
  db.write({
    session: {
      token,
      email: extra?.email ?? pend?.email ?? prev?.email ?? null,
      nickname: extra?.nickname ?? pend?.nickname ?? prev?.nickname ?? null,
      plan: extra?.plan ?? pend?.plan ?? prev?.plan ?? null,
      expiresAt: db.sessionExpiry(),
    },
    // The draft has served its purpose; clearing it stops a stale email from
    // resurfacing on the next registration.
    pending: null,
  });
}

/**
 * Local sign-in used when the AI server is not running.
 *
 * NOT authentication: nothing is verified and the token is made up in the
 * browser. Only reachable in development — see the guard in the sign-in pages.
 */
export function signInOffline(email: string, extra?: { nickname?: string; plan?: string }) {
  completeSignIn("local-no-server-" + Date.now().toString(36), { email, ...extra });
}

export function isOfflineSession(a: Account | null): boolean {
  return !!a && a.token.startsWith("local-no-server-");
}

/** True only in `next dev`. The offline bypass is gated on this. */
export const DEV_MODE = process.env.NODE_ENV !== "production";

/* ── React binding ─────────────────────────────────────────────────────────
   useSyncExternalStore keeps the server snapshot and the first client render
   identical (both "signed out"), which is what React's hydration check wants,
   then swaps in the real session on the same commit — so there is no second
   render pass and no visible flash of the signed-out header. */

let snapshot: Account | null = null;
let snapshotToken = "";

function getSnapshot(): Account | null {
  const a = getAccount();
  const key = a ? `${a.token}|${a.email}|${a.nickname}|${a.plan}` : "";
  // Return the identical object when nothing changed, or React re-renders forever.
  if (key !== snapshotToken) {
    snapshotToken = key;
    snapshot = a;
  }
  return snapshot;
}

const getServerSnapshot = (): Account | null => null;

export function useAuth(): { account: Account | null; ready: boolean } {
  const subscribe = useCallback((fn: () => void) => db.subscribe(fn), []);
  const account = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { account, ready: true };
}

export function displayName(a: Account): string {
  if (a.nickname) return a.nickname;
  if (a.email) return a.email.split("@")[0];
  return "Профиль";
}

export function initials(a: Account): string {
  return displayName(a).trim().charAt(0).toUpperCase() || "?";
}
