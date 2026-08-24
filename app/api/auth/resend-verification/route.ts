import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { resendVerificationEmail } from "@/lib/auth";

export async function POST() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json(unauthenticatedResponse(), { status: 401 });
  }

  const result = await resendVerificationEmail(user.id);
  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: result.error, meta: {} },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: "Verification email dispatched." },
    error: null,
    meta: {},
  });
}
