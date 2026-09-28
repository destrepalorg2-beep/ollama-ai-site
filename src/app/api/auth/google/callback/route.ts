import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";

/**
 * Google sends the browser back here with ?code=&state=. No extra OAuth
 * library needed — it's two plain fetches (code → tokens, token → profile)
 * straight to Google's own endpoints.
 *
 * On success this hands the browser a fresh JWT the same way the email
 * login route does, just carried in the redirect's URL fragment instead of
 * a JSON body (a GET redirect has nowhere else to put it) — see
 * /auth/callback, which reads the fragment and calls completeSignIn().
 * Fragments never reach a server (not Google's, not ours, not any proxy's
 * access log), which is exactly why the token rides there and not in the
 * query string.
 */

export const runtime = "nodejs";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();

function siteOrigin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function GET(req: NextRequest): Promise<Response> {
  const origin = siteOrigin(req);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (!CLIENT_ID || !CLIENT_SECRET) return fail("google_not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("google_state");
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}) as Record<string, unknown>);
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("google token exchange failed", tokenJson);
      return fail("google_failed");
    }

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const info = (await infoRes.json().catch(() => null)) as GoogleUserInfo | null;
    if (!infoRes.ok || !info?.sub || !info.email) {
      console.error("google userinfo failed", info);
      return fail("google_failed");
    }

    await ensureSchema();
    const email = info.email.toLowerCase();
    const nickname = info.name || email.split("@")[0];

    // 1) Already linked to this Google account from a previous sign-in.
    let result = await sql`SELECT id, email, nickname, plan FROM users WHERE google_id = ${info.sub}`;
    let user = result.rows[0] as { id: string; email: string; nickname: string; plan: string } | undefined;

    if (!user) {
      // 2) An existing password account with the same, Google-confirmed
      //    email — link it instead of creating a duplicate account.
      result = await sql`
        UPDATE users SET google_id = ${info.sub}, email_verified = true,
          avatar = COALESCE(avatar, ${info.picture ?? null})
        WHERE email = ${email}
        RETURNING id, email, nickname, plan
      `;
      user = result.rows[0] as typeof user;
    }

    if (!user) {
      // 3) Brand new account.
      result = await sql`
        INSERT INTO users (id, email, password_hash, nickname, plan, avatar, email_verified, google_id)
        VALUES (${randomUUID()}, ${email}, NULL, ${nickname}, 'free', ${info.picture ?? null}, true, ${info.sub})
        RETURNING id, email, nickname, plan
      `;
      user = result.rows[0] as typeof user;
    }

    if (!user) return fail("google_failed");

    const token = signToken(user.id);
    const dest = new URL("/auth/callback", origin);
    dest.hash = new URLSearchParams({
      token,
      email: user.email,
      nickname: user.nickname,
      plan: user.plan,
    }).toString();

    const res = NextResponse.redirect(dest);
    res.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("google callback error", err);
    return fail("google_failed");
  }
}
