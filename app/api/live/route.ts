import { NextResponse } from "next/server";
import { getLiveEvents } from "@/services/odds/odds.service";

export async function GET() {
  try {
    const { events, demoMode } = await getLiveEvents();
    const liveEvents = events.filter((e) => e.isLive);

    return NextResponse.json({
      success: true,
      data: {
        events: liveEvents.length > 0 ? liveEvents : events.slice(0, 4), // return live or top upcoming if none
        count: liveEvents.length,
      },
      error: null,
      meta: { demoMode, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "LIVE_ODDS_UNAVAILABLE", message: "Live odds temporarily unavailable." }, meta: {} },
      { status: 500 }
    );
  }
}
