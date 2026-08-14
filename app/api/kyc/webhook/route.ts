import { NextResponse } from "next/server";
import { processKycWebhookResult } from "@/services/kyc/kyc.service";
import crypto from "crypto";

export async function POST(req: Request) {
  const signature = req.headers.get("x-kyc-signature");
  const secret = process.env.KYC_WEBHOOK_SECRET;

  if (secret && signature) {
    const rawBody = await req.clone().text();
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (signature !== expected) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Invalid KYC webhook signature." }, meta: {} },
        { status: 401 }
      );
    }
  }

  try {
    const body = await req.json();
    const { userId, providerRef, reviewStatus, reason } = body;

    if (!userId || !providerRef) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "INVALID_PAYLOAD", message: "Missing required KYC fields." }, meta: {} },
        { status: 400 }
      );
    }

    const outcome: "VERIFIED" | "REJECTED" =
      reviewStatus === "completed" || reviewStatus === "approved" || reviewStatus === "VERIFIED"
        ? "VERIFIED"
        : "REJECTED";

    await processKycWebhookResult({
      userId,
      providerRef,
      status: outcome,
      reason,
    });

    return NextResponse.json({ success: true, data: { status: outcome }, error: null, meta: {} });
  } catch (err) {
    console.error("KYC webhook processing failed:", err);
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: "KYC processing failed." }, meta: {} },
      { status: 500 }
    );
  }
}
