import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { settleMatchMarket } from "@/services/settlement/settlement.service";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, data: null, error: auth.error, meta: {} }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { eventId, marketKey, outcomeResults, reason } = body;

    if (!eventId || !marketKey || !Array.isArray(outcomeResults)) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_INPUT", message: "eventId, marketKey, and outcomeResults array are required." }, meta: {} },
        { status: 400 }
      );
    }

    const report = await settleMatchMarket({
      eventId,
      marketKey,
      outcomeResults,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: report,
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("Admin settlement error:", err);
    return NextResponse.json(
      { success: false, data: null, error: { code: "SETTLEMENT_FAILED", message: "Settlement execution failed." }, meta: {} },
      { status: 500 }
    );
  }
}
