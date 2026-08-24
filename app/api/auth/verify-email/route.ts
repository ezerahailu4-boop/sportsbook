import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_TOKEN", message: "Verification token is required." }, meta: {} },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);
    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error, meta: {} },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Email successfully verified." },
      error: null,
      meta: {},
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: "Failed to verify email." }, meta: {} },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?verified=false&error=missing_token", req.url));
  }

  const result = await verifyEmail(token);
  if (!result.success) {
    return NextResponse.redirect(new URL(`/?verified=false&error=${result.error?.code || "failed"}`, req.url));
  }

  return NextResponse.redirect(new URL("/?verified=true", req.url));
}
