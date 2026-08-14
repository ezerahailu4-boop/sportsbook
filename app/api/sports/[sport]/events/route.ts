import { NextResponse } from "next/server";
import { getEventsForSport } from "@/services/odds/odds.service";

export async function GET(req: Request, { params }: { params: Promise<{ sport: string }> }) {
  try {
    const { sport } = await params;
    const { events, demoMode } = await getEventsForSport(sport);
    return NextResponse.json({
      success: true,
      data: events,
      error: null,
      meta: { demoMode },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "ODDS_UNAVAILABLE", message: "Live odds are temporarily unavailable. Please try again." },
        meta: {},
      },
      { status: 502 }
    );
  }
}
