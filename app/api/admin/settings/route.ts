import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";

export async function GET() {
  const settings = localDb.getSettings();
  return NextResponse.json({
    success: true,
    data: { settings },
    error: null,
    meta: {},
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const updated = localDb.updateSettings(body);

  return NextResponse.json({
    success: true,
    data: { settings: updated, message: "Platform settings saved successfully." },
    error: null,
    meta: {},
  });
}
