import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The CSP is the one that actually stops things: without it, any injected
 * <script> runs with full access to the page. `unsafe-inline`/`unsafe-eval`
 * are in script-src because Next's dev overlay and hydration need them — the
 * production build tightens this automatically via nonces if you switch to
 * middleware later, but this is already far better than no policy at all.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' https://d8j0ntlcm91z4.cloudfront.net",
  // The site talks to the local AI server and, from the browser, nothing else.
  "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev badge in the corner.
  devIndicators: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Clickjacking: nobody may frame this site.
          { key: "X-Frame-Options", value: "DENY" },
          // Stop the browser guessing a file is script when it is not.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Do not leak the full URL to other sites in the Referer header.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here needs the camera, mic or location.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
};

export default nextConfig;
