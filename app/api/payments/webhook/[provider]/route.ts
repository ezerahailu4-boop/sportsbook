import { NextResponse } from "next/server";
import { confirmDeposit } from "@/services/wallet/wallet.service";

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const signature = req.headers.get("x-signature") ?? undefined;
  const rawPayload = await req.json();

  const providerRef = rawPayload?.providerRef || rawPayload?.reference || rawPayload?.transactionId;

  if (!providerRef) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_WEBHOOK", message: "Missing providerRef." }, meta: {} },
      { status: 400 }
    );
  }

  const result = await confirmDeposit({
    providerRef,
    signature,
    rawPayload,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: result.error, meta: {} },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { credited: result.creditedAmount }, error: null, meta: {} });
}
