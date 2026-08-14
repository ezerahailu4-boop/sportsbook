import { NextResponse } from "next/server";
import { getSports } from "@/services/odds/odds.service";

export async function GET() {
  try {
    const { sports, demoMode } = await getSports();
    return NextResponse.json({
      success: true,
      data: sports,
      error: null,
      meta: { demoMode },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "ODDS_UNAVAILABLE", message: "Failed to load sports list." },
        meta: {},
      },
      { status: 502 }
    );
  }
}
