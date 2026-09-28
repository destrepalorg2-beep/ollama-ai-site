import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Kicks off "Continue with Microsoft": redirects the browser to Microsoft's
 * own consent screen (Entra ID / Azure AD "common" endpoint, so both
 * personal Microsoft accounts and work/school accounts can sign in). Mirrors
 * google/start/route.ts exactly — see that file for the full explanation of
 * the state-cookie CSRF dance.
 */

export const runtime = "nodejs";

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID?.trim();

function siteOrigin(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

export async function GET(req: Request): Promise<Response> {
  if (!CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=microsoft_not_configured", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${siteOrigin(req)}/api/auth/microsoft/callback`;

  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("response_mode", "query");
  authUrl.searchParams.set("scope", "openid email profile User.Read");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("microsoft_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  return res;
}
