"use client";

/**
 * Tiny local store — everything the site remembers between visits lives here,
 * in one versioned record instead of a dozen loose localStorage keys.
 *
 * It is browser storage, not a server database: the data belongs to one
 * browser on one machine, it is readable by anything running on this origin,
 * and it must never hold anything that matters — no passwords, no bot token,
 * no card details. Session tokens only.
 */

const KEY = "aihub.db";
const VERSION = 2;

/** Sliding session window. Every load pushes it forward, so normal use never
 *  signs you out; an untouched browser forgets after this long. */
const SESSION_DAYS = 90;

export type Session = {
  token: string;
  email: string | null;
  nickname: string | null;
  plan: string | null;
  /** ms since epoch; the session is ignored past this point. */
  expiresAt: number;
};

/** Registration in progress: kept only until the email code is confirmed. */
export type Pending = {
  email: string;
  nickname?: string;
  plan?: string;
  userId?: string;
};

export type DB = {
  v: number;
  session: Session | null;
  pending: Pending | null;
  prefs: { lang?: string };
};

export const EMPTY: DB = { v: VERSION, session: null, pending: null, prefs: {} };

const clone = (d: DB): DB => ({
  v: d.v,
  session: d.session && { ...d.session },
  pending: d.pending && { ...d.pending },
  prefs: { ...d.prefs },
});

let cache: DB | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): DB {
  if (!raw) return clone(EMPTY);
  try {
    const parsed = JSON.parse(raw) as Partial<DB>;
    // Anything from an older shape is dropped rather than guessed at — a
    // half-migrated session is worse than one extra sign-in.
    if (parsed?.v !== VERSION) return clone(EMPTY);
    return {
      v: VERSION,
      session: parsed.session ?? null,
      pending: parsed.pending ?? null,
      prefs: parsed.prefs ?? {},
    };
  } catch {
    return clone(EMPTY);
  }
}

export function read(): DB {
  if (cache) return clone(cache);
  if (typeof window === "undefined") return clone(EMPTY);
  let db: DB;
  try {
    db = parse(localStorage.getItem(KEY));
  } catch {
    db = clone(EMPTY); // private mode, blocked storage — carry on in memory
  }
  if (db.session && db.session.expiresAt < Date.now()) db.session = null;
  cache = db;
  return clone(db);
}

export function write(patch: Partial<DB>): DB {
  const next: DB = { ...read(), ...patch, v: VERSION };
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the in-memory cache still serves this tab.
  }
  listeners.forEach((fn) => fn());
  return clone(next);
}

/** Wipe everything this site stored. */
export function reset(): DB {
  cache = clone(EMPTY);
  try {
    localStorage.removeItem(KEY);
    // Sweep the loose keys the earlier version wrote, so nothing lingers.
    ["authToken", "userEmail", "userNickname", "userPlan", "pendingEmail", "pendingPlan", "userId", "siteLang", "profileOwnerId"]
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  listeners.forEach((fn) => fn());
  return clone(EMPTY);
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Another tab changed the store — drop the cache so the next read is fresh. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY && e.key !== null) return;
    cache = null;
    listeners.forEach((fn) => fn());
  });
}

export function sessionExpiry(): number {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

/** Push the expiry forward on an active session. */
export function touchSession(): void {
  const db = read();
  if (!db.session) return;
  write({ session: { ...db.session, expiresAt: sessionExpiry() } });
}
