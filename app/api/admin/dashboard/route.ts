import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getDashboardMetrics } from "@/services/admin/dashboard.service";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const metrics = await getDashboardMetrics();
  return NextResponse.json({ success: true, data: metrics, error: null, meta: {} });
}
