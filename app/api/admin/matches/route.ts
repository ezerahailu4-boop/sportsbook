import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";

export async function GET() {
  const matches = localDb.getAllCustomMatches();
  return NextResponse.json({
    success: true,
    data: { matches },
    error: null,
    meta: {},
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { homeTeam, awayTeam, league, commenceTime, homeOdds, drawOdds, awayOdds } = body;

  if (!homeTeam || !awayTeam) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "VALIDATION_ERROR", message: "Home and away teams are required." }, meta: {} },
      { status: 400 }
    );
  }

  const newMatch = localDb.createCustomMatch({
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sportKey: (league || "soccer_custom").toLowerCase().replace(/\s+/g, "_"),
    sportTitle: league || "Custom League",
    homeTeam,
    awayTeam,
    commenceTime: commenceTime ? new Date(commenceTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
    status: "UPCOMING",
    odds: {
      home: Number(homeOdds) || 2.0,
      draw: Number(drawOdds) || 3.1,
      away: Number(awayOdds) || 3.5,
    },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    data: { match: newMatch, message: "Match created and added to sportsbook odds board." },
    error: null,
    meta: {},
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { matchId, status, homeScore, awayScore, clock } = body;

  const updated = localDb.updateCustomMatch(matchId, {
    status,
    homeScore: homeScore !== undefined ? Number(homeScore) : undefined,
    awayScore: awayScore !== undefined ? Number(awayScore) : undefined,
    clock,
  });

  if (!updated) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "NOT_FOUND", message: "Match not found." }, meta: {} },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { match: updated, message: "Match updated successfully." },
    error: null,
    meta: {},
  });
}
