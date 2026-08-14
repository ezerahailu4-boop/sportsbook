import { NextResponse } from "next/server";
import { getEventsForSport } from "@/services/odds/odds.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    // Search across all sports
    const sports = ["soccer_epl", "soccer_spain_la_liga", "basketball_nba", "tennis_atp", "mma_mixed_martial_arts", "americanfootball_nfl"];
    let foundEvent = null;
    let isDemo = false;

    for (const sport of sports) {
      const { events, demoMode } = await getEventsForSport(sport);
      isDemo = demoMode;
      const match = events.find((e) => e.externalId === eventId);
      if (match) {
        foundEvent = match;
        break;
      }
    }

    if (!foundEvent) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "EVENT_NOT_FOUND", message: "Match not found." }, meta: {} },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { event: foundEvent },
      error: null,
      meta: { demoMode: isDemo },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "FETCH_FAILED", message: "Failed to fetch event." }, meta: {} },
      { status: 500 }
    );
  }
}
