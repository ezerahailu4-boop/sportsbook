import { NextResponse } from "next/server";
import { getEventsForSport } from "@/services/odds/odds.service";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase().trim();

  if (!q || q.length < 2) {
    return NextResponse.json({
      success: true,
      data: { results: [] },
      error: null,
      meta: {},
    });
  }

  const sports = SPORTS_CATEGORIES.map((c) => c.key);
  const allEvents = [];

  for (const s of sports) {
    const { events } = await getEventsForSport(s);
    allEvents.push(...events);
  }

  const matches = allEvents.filter(
    (e) =>
      e.homeTeam.toLowerCase().includes(q) ||
      e.awayTeam.toLowerCase().includes(q) ||
      (e.league && e.league.toLowerCase().includes(q)) ||
      e.sportTitle.toLowerCase().includes(q)
  );

  const results = matches.map((e) => ({
    id: e.externalId,
    title: `${e.homeTeam} vs ${e.awayTeam}`,
    subtitle: `${e.sportTitle} • ${e.league ?? ""}`,
    isLive: e.isLive,
    sportKey: e.sportKey,
    commenceTime: e.commenceTime,
  }));

  return NextResponse.json({
    success: true,
    data: { results },
    error: null,
    meta: { count: results.length },
  });
}
