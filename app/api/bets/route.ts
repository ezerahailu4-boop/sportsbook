import { NextResponse } from "next/server";
import { placeBet } from "@/services/betting/bet-placement.service";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

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
}

export async function POST(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const body = await req.json();

  const result = await placeBet({
    userId: user.id, // trusted session identity — never body.userId
    betType: body.betType,
    stake: body.stake,
    selections: body.selections,
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, data: null, error: result.error, meta: { updatedOdds: result.updatedOdds ?? null } },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { betId: result.betId }, error: null, meta: {} });
}
