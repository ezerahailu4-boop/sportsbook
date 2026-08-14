import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logout } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-crypto";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await logout(token);

  const res = NextResponse.json({ success: true, data: null, error: null, meta: {} });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
