import Link from "next/link";
import { 
  Flame, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { getEventsForSport, getLiveEvents } from "@/services/odds/odds.service";
import { MatchCard } from "@/components/betting/MatchCard";
import { LiveMatchCard } from "@/components/betting/LiveMatchCard";
import { BetSlip } from "@/components/betting/BetSlip";
import { Sidebar } from "@/components/shared/Sidebar";

import { ageInSeconds } from "@/services/odds/odds-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Fresh fixtures on every request

export default async function HomePage() {
  // Fetch popular matches
  const { events: eplEvents } = await getEventsForSport("soccer_epl");
  const { events: nbaEvents } = await getEventsForSport("basketball_nba");
  const { events: liveEvents } = await getLiveEvents();

  const activeLiveEvents = liveEvents.filter((e) => e.isLive);
  const featuredMatch = eplEvents[0] ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="flex gap-6 mt-4">
        
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Feed */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Featured Match & Hero Promo Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="h-3 w-3 mr-1" /> Featured Match
                  </span>
                  <span className="text-xs text-slate-400">{featuredMatch?.league ?? "Premier League"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {featuredMatch ? (
                    <>{featuredMatch.homeTeam} <span className="text-emerald-400 font-normal">vs</span> {featuredMatch.awayTeam}</>
                  ) : (
                    <>Top Matches <span className="text-emerald-400 font-normal">Today</span></>
                  )}
                </h1>
                <p className="text-xs text-slate-300">
                  Live odds with enhanced Accumulator Boost up to 50% extra winnings on 4+ legs.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href={featuredMatch ? `/events/${featuredMatch.externalId}` : "/sports/soccer_epl"}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 transition"
                  >
                    <span>View Match Markets</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/promotions"
                    className="rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    View Promotions
                  </Link>
                </div>
              </div>

              {/* Quick Promo Badge */}
              <div className="hidden md:flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 border border-slate-800 p-4 min-w-[170px] text-center backdrop-blur-sm">
                <Gift className="h-6 w-6 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-white">Welcome Offer</span>
                <span className="text-base font-black text-emerald-400">100% MATCH</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Up to 2,000 ETB</span>
              </div>
            </div>
          </div>

          {/* In-Play Live Now Section */}
          {activeLiveEvents.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                  <h2 className="text-base font-bold text-white">Live In-Play Action</h2>
                </div>
                <Link
                  href="/live"
                  className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                >
                  <span>View All Live ({activeLiveEvents.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLiveEvents.map((event) => (
                  <LiveMatchCard key={event.externalId} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Premier League & Top Football */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Premier League Fixtures</h2>
              </div>
              <Link
                href="/sports/soccer_epl"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
              >
                <span>All Premier League</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {eplEvents.map((event) => {
                const mainMarket = event.markets.find((m) => m.key === "h2h") ?? event.markets[0] ?? null;
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
                      lastUpdatedSecondsAgo={ageInSeconds(event.lastUpdated)}
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

          {/* NBA Basketball Matches */}
          {nbaEvents.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white">NBA Basketball</h2>
                </div>
                <Link
                  href="/sports/basketball_nba"
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  <span>All NBA Matches</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                {nbaEvents.map((event) => {
                  const mainMarket = event.markets.find((m) => m.key === "h2h") ?? event.markets[0] ?? null;
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
                      lastUpdatedSecondsAgo={ageInSeconds(event.lastUpdated)}
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
          )}

          {/* Footer Responsible Gaming & Compliance Info */}
          <footer className="mt-8 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col gap-4 text-slate-400 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                18+
              </div>
              <p className="text-[11px] leading-relaxed">
                Gambling can be addictive. Play responsibly. Only wager funds you can afford to lose.
                Self-exclusion and deposit limit tools are available in the <Link href="/responsible-gambling" className="text-emerald-400 underline">Responsible Play portal</Link>.
              </p>
            </div>
            <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
              <p>© 2026 ApexBet Sportsbook. All rights reserved. Licensed & Regulated.</p>
              <div className="flex gap-4">
                <Link href="/responsible-gambling" className="hover:text-slate-300">Responsible Gaming</Link>
                <Link href="/promotions" className="hover:text-slate-300">Promotion Terms</Link>
                <Link href="/admin" className="hover:text-amber-400">Admin Operations</Link>
              </div>
            </div>
          </footer>

        </div>

        {/* Right Sticky Bet Slip */}
        <BetSlip />

      </div>

    </div>
  );
}
