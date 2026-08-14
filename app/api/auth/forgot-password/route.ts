import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_EMAIL", message: "Email is required." }, meta: {} },
        { status: 400 }
      );
    }

    // In demo/prototype mode, simulate password reset email dispatch
    return NextResponse.json({
      success: true,
      data: { message: "If an account with that email exists, a password reset link has been dispatched." },
      error: null,
      meta: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: "Failed to process request." }, meta: {} },
      { status: 500 }
    );
  }
}
