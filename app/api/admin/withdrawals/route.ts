import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const withdrawals = localDb.getAllWithdrawals();
  return NextResponse.json({
    success: true,
    data: { withdrawals },
    error: null,
    meta: {},
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { withdrawalId, action, notes } = body;

    if (!withdrawalId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "BAD_REQUEST", message: "Invalid withdrawal action" }, meta: {} },
        { status: 400 }
      );
    }

    const result = localDb.processWithdrawal(withdrawalId, action, notes);
    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "PROCESS_FAILED", message: result.message }, meta: {} },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: result.message },
      error: null,
      meta: {},
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INTERNAL_ERROR", message: (err as Error).message }, meta: {} },
      { status: 500 }
    );
  }
}
