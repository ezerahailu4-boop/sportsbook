import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_EMAIL", message: "A valid email address is required." }, meta: {} },
        { status: 400 }
      );
    }

    // Generate token and log reset URL (demo mode)
    await createPasswordResetToken(email);

    return NextResponse.json({
      success: true,
      data: { message: "If an account with that email exists, a password reset link has been dispatched." },
      error: null,
      meta: {},
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: "Failed to process password reset request." }, meta: {} },
      { status: 500 }
    );
  }
}
