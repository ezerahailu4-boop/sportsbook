import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";
import { getLiveEvents } from "@/services/odds/odds.service";

export async function GET() {
  const users = localDb.getAllUsersWithWallets();
  const deposits = localDb.getAllDeposits();
  const customMatches = localDb.getAllCustomMatches();
  const bets = localDb.getAllBets();

  // Fetch real live matches from ESPN/API-Football
  let liveMatches: any[] = [];
  try {
    const oddsResult = await getLiveEvents();
    liveMatches = oddsResult.events || [];
  } catch (e) {
    liveMatches = [];
  }

  // Filter deposits
  const pendingDeposits = deposits.filter((d) => d.status === "PENDING_VERIFICATION");
  const approvedDeposits = deposits.filter((d) => d.status === "APPROVED");
  const totalDepositVolume = approvedDeposits.reduce((sum, d) => sum + d.amount, 0);

  // Compute real bet metrics
  const totalStakes = bets.reduce((sum, b) => sum + b.stake, 0);
  const wonBets = bets.filter((b) => b.status === "WON");
  const totalPayouts = wonBets.reduce((sum, b) => sum + b.potentialReturn, 0);
  const ggr = totalStakes - totalPayouts;
  const marginPercent = totalStakes > 0 ? ((ggr / totalStakes) * 100).toFixed(1) : "0.0";

  // Compute real 7-day revenue performance by calendar day
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);

    const dayName = i === 0 ? "Today" : daysOfWeek[d.getDay()];

    // Bets placed on that day
    const dayBets = bets.filter((b) => {
      const betDate = new Date(b.placedAt);
      return betDate >= d && betDate < nextD;
    });

    const dayTurnover = dayBets.reduce((sum, b) => sum + b.stake, 0);
    const dayPayouts = dayBets.filter((b) => b.status === "WON").reduce((sum, b) => sum + b.potentialReturn, 0);
    const dayGgr = dayTurnover - dayPayouts;

    chartData.push({
      day: dayName,
      turnover: dayTurnover,
      payouts: dayPayouts,
      ggr: dayGgr,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalStakes: `${totalStakes.toLocaleString()} ETB`,
        totalPayouts: `${totalPayouts.toLocaleString()} ETB`,
        ggr: `${ggr >= 0 ? "+" : ""}${ggr.toLocaleString()} ETB`,
        marginPercent: `${marginPercent}%`,
        activePlayers: users.length,
        totalTreasury: `${(100000 + ggr + totalDepositVolume).toLocaleString()} ETB`,
        pendingDepositsCount: pendingDeposits.length,
        totalDepositVolume: `${totalDepositVolume.toLocaleString()} ETB`,
        liveMatchesCount: liveMatches.length + customMatches.filter((m) => m.status === "LIVE").length,
      },
      chartData,
      liveMatches: liveMatches.slice(0, 8),
      customMatches,
      recentDeposits: deposits.slice(0, 10),
      recentUsers: users.slice(0, 10),
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
}
