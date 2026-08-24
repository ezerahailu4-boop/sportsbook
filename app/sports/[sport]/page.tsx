import { getEventsForSport } from "@/services/odds/odds.service";
import { MatchCard } from "@/components/betting/MatchCard";
import { BetSlip } from "@/components/betting/BetSlip";
import { Sidebar } from "@/components/shared/Sidebar";

import { ageInSeconds } from "@/services/odds/odds-cache";

export const revalidate = 15;

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  const { events } = await getEventsForSport(sport);
  const formattedSportName = sport.replace(/_/g, " ").replace("soccer", "Football").toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


      <div className="flex gap-6 mt-4">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">{formattedSportName}</h1>
              <p className="text-xs text-slate-400">Available pre-match & live fixtures</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-slate-300">
              {events.length} Events
            </span>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-300">No events found for this category.</p>
              <p className="text-xs text-slate-500 mt-1">Please select another sport from the sidebar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((event) => {
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
          )}
        </div>

        <BetSlip />
      </div>
    </div>
  );
}
