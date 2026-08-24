import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;
    const password = body?.password;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_TOKEN", message: "Password reset token is required." }, meta: {} },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 10) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "WEAK_PASSWORD", message: "Password must be at least 10 characters." }, meta: {} },
        { status: 400 }
      );
    }

    const result = await resetPassword(token, password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error, meta: {} },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Password has been successfully updated. Please sign in with your new password." },
      error: null,
      meta: {},
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: "Failed to reset password." }, meta: {} },
      { status: 500 }
    );
  }
}
