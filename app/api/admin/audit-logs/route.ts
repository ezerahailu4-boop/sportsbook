import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFullAdmin } from "@/lib/require-admin";

// Audit logs are the most sensitive admin view — full admin only, not
// support/risk roles.
export async function GET(req: Request) {
  const gate = await requireFullAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");

  const logs = await prisma.auditLog.findMany({
    where: targetType ? { targetType } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, data: logs, error: null, meta: {} });
}
