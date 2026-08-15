import { Flame, Radio, RefreshCw } from "lucide-react";
import { getLiveEvents } from "@/services/odds/odds.service";
import { LiveMatchCard } from "@/components/betting/LiveMatchCard";
import { BetSlip } from "@/components/betting/BetSlip";
import { Sidebar } from "@/components/shared/Sidebar";
import { DemoModeBanner } from "@/components/shared/DemoModeBanner";

export const dynamic = "force-dynamic";
export const revalidate = 5; // Fast revalidation for live betting

export default async function LiveBettingPage() {
  const { events, demoMode } = await getLiveEvents();
  const liveEvents = events.filter((e) => e.isLive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <DemoModeBanner active={demoMode} />

      <div className="flex gap-6 mt-4">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-5 min-w-0">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Live In-Play Arena</span>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    {liveEvents.length} Active
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Real-time match trackers, momentum and shifting odds</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Radio className="h-3.5 w-3.5 text-red-500 animate-ping" />
              <span className="hidden sm:inline">Auto-Syncing</span>
            </div>
          </div>

          {/* Matches Grid */}
          {liveEvents.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-300">No live matches in progress right now.</p>
              <p className="text-xs text-slate-500 mt-1">Check back soon or explore upcoming fixtures in the Sports section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {liveEvents.map((event) => (
                <LiveMatchCard key={event.externalId} event={event} />
              ))}
            </div>
          )}

        </div>

        <BetSlip />
      </div>

    </div>
  );
}
