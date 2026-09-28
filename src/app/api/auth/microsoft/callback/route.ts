import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";

/**
 * Microsoft sends the browser back here with ?code=&state=. Same shape as
 * google/callback/route.ts: exchange the code for a token, read the profile
 * from Microsoft Graph, upsert the user, hand back our own JWT via the
 * /auth/callback URL fragment. See that file for the fuller commentary —
 * this one only calls out where Microsoft's API differs from Google's.
 */

export const runtime = "nodejs";

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET?.trim();

function siteOrigin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

interface MicrosoftUserInfo {
  id: string;
  mail?: string | null;
  userPrincipalName?: string;
  displayName?: string;
}

export async function GET(req: NextRequest): Promise<Response> {
  const origin = siteOrigin(req);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (!CLIENT_ID || !CLIENT_SECRET) return fail("microsoft_not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("microsoft_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("microsoft_state");
  }

  try {
    const redirectUri = `${origin}/api/auth/microsoft/callback`;
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: "openid email profile User.Read",
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}) as Record<string, unknown>);
    if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
      console.error("microsoft token exchange failed", tokenJson);
      return fail("microsoft_failed");
    }

    const infoRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const info = (await infoRes.json().catch(() => null)) as MicrosoftUserInfo | null;
    // Work/school accounts usually have `mail`; personal Microsoft accounts
    // (outlook.com/hotmail/live) often leave it null and only fill in
    // `userPrincipalName`, which for a personal account IS the sign-in
    // email — fall back to that.
    const rawEmail = info?.mail || info?.userPrincipalName;
    if (!infoRes.ok || !info?.id || !rawEmail) {
      console.error("microsoft userinfo failed", info);
      return fail("microsoft_failed");
    }

    await ensureSchema();
    const email = rawEmail.toLowerCase();
    const nickname = info.displayName || email.split("@")[0];

    // 1) Already linked to this Microsoft account from a previous sign-in.
    let result = await sql`SELECT id, email, nickname, plan FROM users WHERE microsoft_id = ${info.id}`;
    let user = result.rows[0] as { id: string; email: string; nickname: string; plan: string } | undefined;

    if (!user) {
      // 2) An existing password (or other-provider) account with the same,
      //    Microsoft-confirmed email — link it instead of duplicating.
      result = await sql`
        UPDATE users SET microsoft_id = ${info.id}, email_verified = true
        WHERE email = ${email}
        RETURNING id, email, nickname, plan
      `;
      user = result.rows[0] as { id: string; email: string; nickname: string; plan: string } | undefined;
    }

    if (!user) {
      // 3) Brand new account.
      result = await sql`
        INSERT INTO users (id, email, password_hash, nickname, plan, email_verified, microsoft_id)
        VALUES (${randomUUID()}, ${email}, NULL, ${nickname}, 'free', true, ${info.id})
        RETURNING id, email, nickname, plan
      `;
      user = result.rows[0] as { id: string; email: string; nickname: string; plan: string } | undefined;
    }

    if (!user) return fail("microsoft_failed");

    const token = signToken(user.id);
    const dest = new URL("/auth/callback", origin);
    dest.hash = new URLSearchParams({
      token,
      email: user.email,
      nickname: user.nickname,
      plan: user.plan,
    }).toString();

    const res = NextResponse.redirect(dest);
    res.cookies.set("microsoft_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("microsoft callback error", err);
    return fail("microsoft_failed");
  }
}
