import Link from "next/link";
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Layers 
} from "lucide-react";
import { getEventsForSport, getLiveEvents } from "@/services/odds/odds.service";
import { MatchCard } from "@/components/betting/MatchCard";
import { LiveMatchCard } from "@/components/betting/LiveMatchCard";
import { BetSlip } from "@/components/betting/BetSlip";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopLeaguesBar } from "@/components/betting/TopLeaguesBar";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TodaysGamesPage() {
  const sports = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_uefa_champs_league",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_saudi_arabia_pro_league",
    "soccer_usa_mls",
    "soccer_netherlands_eredivisie",
  ];

  const results = await Promise.all([
    ...sports.map((s) => getEventsForSport(s)),
    getLiveEvents(),
  ]);

  const allEvents: NormalizedEvent[] = [];
  results.forEach((res) => {
    if ("events" in res && Array.isArray(res.events)) {
      allEvents.push(...res.events);
    }
  });

  // Filter for today's matches or live matches
  const now = new Date();
  const todayStr = now.toDateString();

  let todaysEvents = allEvents.filter((event) => {
    if (event.isLive) return true;
    const evtDate = new Date(event.commenceTime);
    return evtDate.toDateString() === todayStr;
  });

  // If few matches today, include the next closest upcoming fixtures within 48h
  if (todaysEvents.length < 8) {
    const upcomingEvents = allEvents
      .filter((e) => !todaysEvents.some((t) => t.externalId === e.externalId))
      .slice(0, 16);
    todaysEvents = [...todaysEvents, ...upcomingEvents];
  }

  const liveMatches = todaysEvents.filter((e) => e.isLive);
  const scheduledMatches = todaysEvents.filter((e) => !e.isLive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
      
      {/* Page Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>OFFICIAL SCHEDULE</span>
              </span>
              <span className="text-xs text-slate-400">
                {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Today's Featured <span className="text-emerald-400">Matches & Games</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Live odds, in-play wagers, and complete 24+ market suites for all matches scheduled today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 border border-slate-800 px-5 py-3 text-center backdrop-blur-md">
              <span className="text-2xl font-black text-emerald-400">{todaysEvents.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Games</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Feed */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <TopLeaguesBar />

          {/* Live In-Play Today */}
          {liveMatches.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                  <h2 className="text-base font-black text-white">Live In-Play Right Now</h2>
                </div>
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 animate-pulse">
                  {liveMatches.length} Live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveMatches.map((event) => (
                  <LiveMatchCard key={event.externalId} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Today's Scheduled Fixtures */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-black text-white">Today's Fixtures ({scheduledMatches.length})</h2>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {scheduledMatches.map((event) => {
                const mainMarket =
                  event.markets.find((m) => m.key === "h2h") ?? event.markets[0] ?? null;

                return (
                  <MatchCard
                    key={event.externalId}
                    eventId={event.externalId}
                    league={event.league}
                    homeTeam={event.homeTeam}
                    awayTeam={event.awayTeam}
                    commenceTime={event.commenceTime}
                    isLive={event.isLive}
                    liveMinute={event.liveMinute}
                    score={event.score}
                    marketCount={event.markets.length}
                    lastUpdatedSecondsAgo={10}
                    mainMarket={
                      mainMarket
                        ? {
                            key: mainMarket.key,
                            name: mainMarket.name,
                            bookmakerKey: mainMarket.bookmakerKey,
                            outcomes: mainMarket.outcomes.map((o) => ({
                              outcomeId: o.externalId,
                              name: o.name,
                              price: o.price,
                              point: o.point,
                            })),
                          }
                        : null
                    }
                  />
                );
              })}
            </div>
          </div>

        </div>

        <BetSlip />
      </div>

    </div>
  );
}
