import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { submitKyc } from "@/services/kyc/kyc.service";

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();
  const result = await submitKyc(user.id, body.documents);

  return NextResponse.json({ success: true, data: result, error: null, meta: {} });
}
