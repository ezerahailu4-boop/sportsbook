import { NextResponse } from "next/server";
import { getEventsForSport } from "@/services/odds/odds.service";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    // Search candidate sports prioritizing matched key
    const allSportKeys = SPORTS_CATEGORIES.map((c) => c.key);
    const matchedSportKey = allSportKeys.find((k) => eventId.includes(k));
    const sports = matchedSportKey
      ? [matchedSportKey, ...allSportKeys.filter((k) => k !== matchedSportKey)]
      : allSportKeys;

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
