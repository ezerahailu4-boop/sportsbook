import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { updateLimits } from "@/services/betting/responsible-gambling.service";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();
  const settings = await updateLimits({
    userId: user.id,
    depositLimit: body.depositLimit,
    lossLimit: body.lossLimit,
    sessionLimitMins: body.sessionLimitMins,
  });

  return NextResponse.json({ success: true, data: settings, error: null, meta: {} });
}
