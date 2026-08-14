import { cookies } from "next/headers";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-crypto";

export type { SessionUser };

export async function requireSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(token);
}

export function unauthenticatedResponse() {
  return {
    success: false as const,
    data: null,
    error: { code: "UNAUTHENTICATED", message: "You must be logged in." },
    meta: {},
  };
}
