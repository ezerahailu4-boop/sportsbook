import argon2 from "argon2";
import { randomUUID } from "crypto";

// Argon2id per spec section 20/51. Never use bcrypt/md5/sha for passwords.
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export function newSessionToken(): string {
  return randomUUID();
}

// Cookie config used everywhere a session cookie is set. HTTP-only + secure
// + sameSite=lax is the baseline; CSRF protection for state-changing routes
// is layered on top in lib/csrf.ts, not replaced by this.
export const SESSION_COOKIE_NAME = "sb_session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
