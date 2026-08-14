import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { selfExclude } from "@/services/betting/responsible-gambling.service";

// Deliberately irreversible from the user side within this endpoint — no
// "undo self-exclusion" path exists here on purpose.
export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();
  const days = Number(body.days);
  if (!Number.isFinite(days) || days < 1) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_DURATION", message: "Invalid self-exclusion duration." }, meta: {} },
      { status: 400 }
    );
  }

  const result = await selfExclude(user.id, days);
  return NextResponse.json({ success: true, data: { until: result.until }, error: null, meta: {} });
}
