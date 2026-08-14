import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Flame, Shield, Radio } from "lucide-react";
import { getEventsForSport } from "@/services/odds/odds.service";
import { MarketCard } from "@/components/betting/MarketCard";
import { BetSlip } from "@/components/betting/BetSlip";
import { Sidebar } from "@/components/shared/Sidebar";
import { DemoModeBanner } from "@/components/shared/DemoModeBanner";
import { ageInSeconds } from "@/services/odds/odds-cache";

export const revalidate = 10;

export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const sports = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_uefa_champs_league",
    "basketball_nba",
    "tennis_atp",
    "mma_mixed_martial_arts",
    "americanfootball_nfl",
  ];

  let foundEvent = null;
  let isDemo = true;

  for (const s of sports) {
    const { events, demoMode } = await getEventsForSport(s);
    isDemo = demoMode;
    const match = events.find((e) => e.externalId === eventId);
    if (match) {
      foundEvent = match;
      break;
    }
  }

  if (!foundEvent) {
    notFound();
  }

  const eventLabel = `${foundEvent.homeTeam} vs ${foundEvent.awayTeam}`;
  const formattedDate = new Date(foundEvent.commenceTime).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DemoModeBanner active={isDemo} />

      <div className="flex gap-6 mt-4">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-5 min-w-0">
          
          {/* Back button */}
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Matches</span>
          </Link>

          {/* Match Banner Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {foundEvent.league ?? foundEvent.sportTitle}
                </span>

                {foundEvent.isLive ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>LIVE {foundEvent.liveMinute ? `• ${foundEvent.liveMinute}` : ""}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>

              {/* Matchup Header */}
              <div className="grid grid-cols-3 items-center py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-base font-black text-white">
                    {foundEvent.homeTeam[0]}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white mt-1">{foundEvent.homeTeam}</h2>
                </div>

                <div className="flex flex-col items-center">
                  {foundEvent.isLive && foundEvent.score ? (
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-wider">
                      {foundEvent.score}
                    </span>
                  ) : (
                    <span className="text-lg font-black text-slate-600">VS</span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-base font-black text-white">
                    {foundEvent.awayTeam[0]}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white mt-1">{foundEvent.awayTeam}</h2>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span>Odds synced {ageInSeconds(foundEvent.lastUpdated)}s ago</span>
                </span>
                <span>{foundEvent.markets.length} Betting Markets Available</span>
              </div>
            </div>
          </div>

          {/* Markets List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
              Available Betting Markets
            </h3>

            {foundEvent.markets.map((market) => (
              <MarketCard
                key={market.key}
                market={market}
                eventId={foundEvent.externalId}
                eventLabel={eventLabel}
                commenceTime={foundEvent.commenceTime}
              />
            ))}
          </div>

        </div>

        <BetSlip />
      </div>
    </div>
  );
}
