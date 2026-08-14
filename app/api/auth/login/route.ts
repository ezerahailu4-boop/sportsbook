import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth-crypto";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await login({
    email: body.email,
    password: body.password,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, data: null, error: result.error, meta: {} }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, data: { userId: result.userId }, error: null, meta: {} });
  res.cookies.set(SESSION_COOKIE_NAME, result.token, SESSION_COOKIE_OPTIONS);
  return res;
}
