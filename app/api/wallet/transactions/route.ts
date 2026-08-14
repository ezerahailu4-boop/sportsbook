import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
  if (!wallet) {
    return NextResponse.json({ success: true, data: [], error: null, meta: {} });
  }

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: transactions, error: null, meta: {} });
}
