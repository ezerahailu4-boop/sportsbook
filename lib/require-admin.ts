import { requireSessionUser, type SessionUser as _SessionUser } from "@/lib/require-session";

// Every /api/admin/* route must call this first. Role is read from the
// server-side session (lib/auth.ts), never from a client-supplied header
// or body field — the client cannot claim admin permissions.
export async function requireAdmin() {
  const user = await requireSessionUser();
  if (!user) return { ok: false as const, status: 401, error: { code: "UNAUTHENTICATED", message: "Login required." } };
  if (user.role !== "ADMIN" && user.role !== "RISK" && user.role !== "SUPPORT") {
    return { ok: false as const, status: 403, error: { code: "FORBIDDEN", message: "Admin access required." } };
  }
  return { ok: true as const, user };
}

export async function requireFullAdmin() {
  const user = await requireSessionUser();
  if (!user) return { ok: false as const, status: 401, error: { code: "UNAUTHENTICATED", message: "Login required." } };
  if (user.role !== "ADMIN") {
    return { ok: false as const, status: 403, error: { code: "FORBIDDEN", message: "Full admin access required." } };
  }
  return { ok: true as const, user };
}
