import { NextResponse } from "next/server";
import { getEventsForSport, getSports } from "@/services/odds/odds.service";

export async function POST() {
  const sportsToSync = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_uefa_champs_league",
    "basketball_nba",
    "tennis_atp",
    "mma_mixed_martial_arts",
    "americanfootball_nfl",
  ];

  const results = [];

  for (const sport of sportsToSync) {
    try {
      const res = await getEventsForSport(sport);
      results.push({
        sport,
        eventCount: res.events.length,
        demoMode: res.demoMode,
        status: "SYNCED",
      });
    } catch (err) {
      results.push({
        sport,
        eventCount: 0,
        demoMode: true,
        status: "ERROR",
        error: (err as Error).message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      syncedAt: new Date().toISOString(),
      results,
    },
    error: null,
    meta: {},
  });
}
