import { NextResponse } from "next/server";
import { startWithdrawal } from "@/services/wallet/wallet.service";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();

  const result = await startWithdrawal({
    userId: user.id,
    amount: body.amount,
    currency: body.currency ?? "ETB",
    method: body.method,
    destination: body.destination,
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, data: null, error: result.error, meta: {} }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { withdrawalId: result.withdrawalId }, error: null, meta: {} });
}
