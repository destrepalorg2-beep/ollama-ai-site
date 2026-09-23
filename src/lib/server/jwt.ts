/**
 * Signs and verifies the account JWT used by the cloud auth API
 * (/api/auth/register, /api/auth/login, /api/profile). Server-side only.
 */

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function signToken(userId: string): string {
  if (!SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): string | null {
  if (!SECRET) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}

/** Pulls the user id out of an `Authorization: Bearer <token>` header. */
export function userIdFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return token ? verifyToken(token) : null;
}
