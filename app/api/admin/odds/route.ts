import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getOddsMonitor } from "@/services/admin/odds-monitor.service";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const rows = await getOddsMonitor(searchParams.get("sport") ?? undefined);

  return NextResponse.json({ success: true, data: rows, error: null, meta: {} });
}
