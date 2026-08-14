import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/require-admin";
import { adjustBalance } from "@/services/admin/user-management.service";

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const gate = await requireFullAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const { userId } = await params;
  const body = await req.json();
  const result = await adjustBalance({ adminId: gate.user.id, userId, amount: body.amount, reason: body.reason });

  if (!result.success) return NextResponse.json({ success: false, data: null, error: result.error, meta: {} }, { status: 400 });
  return NextResponse.json({ success: true, data: null, error: null, meta: {} });
}
