import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/require-admin";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const bets = await prisma.bet.findMany({
    where: status ? { status: status as any } : {},
    include: { selections: true, user: { select: { email: true } } },
    orderBy: { placedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: bets, error: null, meta: {} });
}
