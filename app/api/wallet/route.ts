import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";

const prisma = new PrismaClient();

export async function GET() {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const wallet = await prisma.wallet.findFirst({ where: { userId: user.id, mode: "DEMO" } });

  return NextResponse.json({
    success: true,
    data: wallet ?? { availableBalance: "0.00", lockedBalance: "0.00" },
    error: null,
    meta: {},
  });
}
