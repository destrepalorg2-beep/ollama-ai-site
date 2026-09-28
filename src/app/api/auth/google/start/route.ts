import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Kicks off "Continue with Google": redirects the browser to Google's own
 * consent screen. No page of ours renders here — it's a 302 the Google
 * button just navigates to (see auth-form.tsx's onSocialSignIn("google")).
 */

export const runtime = "nodejs";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();

function siteOrigin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

export async function GET(req: Request): Promise<Response> {
  if (!CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${siteOrigin(req)}/api/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  // Short-lived and http-only — its only job is proving the callback is
  // answering *this* redirect (CSRF), never read by any client script.
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  return res;
}
