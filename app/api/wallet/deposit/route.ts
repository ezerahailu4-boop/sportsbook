import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/require-session";
import { localDb } from "@/lib/local-store";

export async function POST(req: Request) {
  const sessionUser = await requireSessionUser();

  const body = await req.json();
  const numericAmount = Number(body.amount);

  if (!numericAmount || numericAmount <= 0) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "INVALID_AMOUNT", message: "Amount must be greater than zero." }, meta: {} },
      { status: 400 }
    );
  }

  // Find user by session, or look up by senderAccount / phone
  let userId = sessionUser?.id;
  let userEmail = sessionUser?.email;

  if (!userId && body.senderAccount) {
    const matchedUser = localDb.getUserByEmailOrPhone(body.senderAccount);
    if (matchedUser) {
      userId = matchedUser.id;
      userEmail = matchedUser.email;
    }
  }

  const deposit = localDb.createDeposit({
    id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: userId || "usr_guest_payer",
    userEmail: userEmail || body.senderAccount || body.senderName || "guest@sportsbook.demo",
    amount: numericAmount,
    currency: body.currency ?? "ETB",
    paymentMethod: body.paymentMethod === "cbe" ? "cbe" : "telebirr",
    senderName: body.senderName || "Unknown Sender",
    senderAccount: body.senderAccount || "N/A",
    screenshotUrl: body.screenshotUrl,
    status: "PENDING_VERIFICATION",
    createdAt: new Date().toISOString(),
  });

  console.log("📥 [NEW DEPOSIT QUEUED FOR ADMIN]", deposit);

  return NextResponse.json({
    success: true,
    data: { depositId: deposit.id, status: deposit.status },
    error: null,
    meta: {},
  });
}
