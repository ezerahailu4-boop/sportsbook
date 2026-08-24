import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";

export async function GET() {
  const deposits = localDb.getAllDeposits();
  return NextResponse.json({
    success: true,
    data: { deposits },
    error: null,
    meta: {},
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { depositId, action } = body;

  if (action === "APPROVE") {
    const res = localDb.approveDeposit(depositId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "Deposit request not found." }, meta: {} },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { deposit: res.deposit, message: "Deposit approved and user wallet credited successfully." },
      error: null,
      meta: {},
    });
  } else if (action === "REJECT") {
    const res = localDb.rejectDeposit(depositId);
    if (!res.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "Deposit request not found." }, meta: {} },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { deposit: res.deposit, message: "Deposit rejected." },
      error: null,
      meta: {},
    });
  }

  return NextResponse.json(
    { success: false, data: null, error: { code: "INVALID_ACTION", message: "Invalid action." }, meta: {} },
    { status: 400 }
  );
}
