import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { searchUsers } from "@/services/admin/user-management.service";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ success: false, data: null, error: gate.error, meta: {} }, { status: gate.status });

  const { searchParams } = new URL(req.url);
  const users = await searchUsers(searchParams.get("q") ?? "", searchParams.get("status") ?? undefined);

  return NextResponse.json({ success: true, data: users, error: null, meta: {} });
}
