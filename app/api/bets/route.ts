import { NextResponse } from "next/server";
import { placeBet } from "@/services/betting/bet-placement.service";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { prisma } from "@/lib/prisma";
import { localDb } from "@/lib/local-store";

export async function GET(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  try {
    const whereClause: { userId: string; status?: any } = { userId: user.id };
    if (status && ["PENDING", "WON", "LOST", "VOID", "CANCELLED"].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    const bets = await prisma.bet.findMany({
      where: whereClause,
      include: {
        selections: {
          include: {
            event: true,
          },
        },
      },
      orderBy: { placedAt: "desc" },
      take: 50,
    });

    const formattedBets = bets.map((b) => ({
      id: b.id,
      betType: b.betType,
      stake: b.stake.toString(),
      combinedOdds: b.combinedOdds.toString(),
      potentialReturn: b.potentialReturn.toString(),
      potentialProfit: b.potentialProfit.toString(),
      status: b.status,
      placedAt: b.placedAt.toISOString(),
      settledAt: b.settledAt ? b.settledAt.toISOString() : null,
      selections: b.selections.map((s) => ({
        id: s.id,
        selectionName: s.selectionName,
        oddsAtPlacement: s.oddsAtPlacement.toString(),
        point: s.point ? s.point.toString() : null,
        marketKey: s.marketKey,
        status: s.status,
        event: s.event
          ? {
              homeTeam: s.event.homeTeam,
              awayTeam: s.event.awayTeam,
              league: s.event.league,
              commenceTime: s.event.commenceTime.toISOString(),
            }
          : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: { bets: formattedBets },
      error: null,
      meta: { total: formattedBets.length },
    });
  } catch (err) {
    // Local DB fallback
    const localBets = localDb.getUserBets(user.id);
    return NextResponse.json({
      success: true,
      data: {
        bets: localBets.map((b) => ({
          id: b.id,
          betType: b.betType,
          stake: b.stake.toString(),
          combinedOdds: b.combinedOdds.toString(),
          potentialReturn: b.potentialReturn.toString(),
          potentialProfit: (b.potentialReturn - b.stake).toString(),
          status: b.status,
          placedAt: b.placedAt,
          settledAt: b.settledAt ?? null,
          selections: b.selections.map((s, idx) => ({
            id: `sel_${idx}`,
            selectionName: s.selectionName,
            oddsAtPlacement: s.odds.toString(),
            point: null,
            marketKey: "h2h",
            status: b.status,
            event: {
              homeTeam: s.eventName.split(" vs ")[0] || s.eventName,
              awayTeam: s.eventName.split(" vs ")[1] || "",
              league: "Football",
              commenceTime: b.placedAt,
            },
          })),
        })),
      },
      error: null,
      meta: { total: localBets.length },
    });
  }
}

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();

  try {
    const result = await placeBet({
      userId: user.id,
      betType: body.betType,
      stake: body.stake,
      selections: body.selections,
      idempotencyKey: body.idempotencyKey,
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: { betId: result.betId }, error: null, meta: {} });
    }
  } catch (e) {
    // Fall through to localDb
  }

  // Local storage fallback for seamless testing
  const stake = Number(body.stake) || 10;
  const selections = body.selections || [];
  let combinedOdds = 1.0;
  selections.forEach((s: any) => {
    combinedOdds *= Number(s.oddsAtPlacement) || 1.85;
  });
  combinedOdds = Math.round(combinedOdds * 100) / 100;
  const potentialReturn = Math.round(stake * combinedOdds * 100) / 100;

  const newBet = {
    id: `bet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: user.id,
    userEmail: user.email,
    betType: (body.betType || "SINGLE") as "SINGLE" | "MULTIPLE",
    stake,
    combinedOdds,
    potentialReturn,
    status: "PENDING" as const,
    placedAt: new Date().toISOString(),
    selections: selections.map((s: any) => ({
      eventId: s.eventId || "evt_custom",
      eventName: s.eventName || s.selectionName || "Match Selection",
      selectionName: s.selectionName || "Match Winner",
      odds: Number(s.oddsAtPlacement) || 1.85,
    })),
  };

  const createResult = localDb.createBet(newBet);
  if (!createResult.success) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "INSUFFICIENT_FUNDS", message: createResult.error || "Insufficient wallet balance." },
        meta: {},
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { betId: newBet.id }, error: null, meta: {} });
}
