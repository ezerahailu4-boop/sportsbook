import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { localDb } from "@/lib/local-store";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();
  const amount = Number(body.amount);

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_AMOUNT", message: "Withdrawal amount must be greater than 0" }, meta: {} },
      { status: 400 }
    );
  }

  const storedUser = localDb.getUserById(user.id);

  const result = localDb.createWithdrawal({
    userId: user.id,
    amount,
    currency: body.currency || "ETB",
    method: body.method || "telebirr",
    accountNumber: body.accountNumber || storedUser?.phone || "0911000000",
    accountName: body.accountName || `${storedUser?.firstName || ""} ${storedUser?.lastName || ""}`.trim() || user.email,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "WITHDRAWAL_FAILED", message: result.error || "Insufficient balance" }, meta: {} },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      withdrawalId: result.withdrawalId,
      message: `Withdrawal request for ${amount} ETB submitted to operator queue.`,
    },
    error: null,
    meta: {},
  });
}
