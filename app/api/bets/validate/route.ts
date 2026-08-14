import { NextResponse } from "next/server";
import { validateBetRequest } from "@/services/betting/bet-validation.service";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();

  const result = await validateBetRequest({
    userId: user.id,
    betType: body.betType,
    stake: body.stake,
    selections: body.selections,
    idempotencyKey: "validate-only",
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: result.error, meta: { updatedOdds: result.updatedOdds ?? null } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      combinedOdds: result.combinedOdds.toString(),
      potentialReturn: result.potentialReturn.toString(),
      potentialProfit: result.potentialProfit.toString(),
    },
    error: null,
    meta: {},
  });
}
