import { NextResponse } from "next/server";
import { startDeposit } from "@/services/wallet/wallet.service";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();

  const result = await startDeposit({
    userId: user.id,
    amount: body.amount,
    currency: body.currency ?? "ETB",
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, data: null, error: result.error, meta: {} }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: { checkoutUrl: result.checkoutUrl, transactionId: result.transactionId },
    error: null,
    meta: {},
  });
}
