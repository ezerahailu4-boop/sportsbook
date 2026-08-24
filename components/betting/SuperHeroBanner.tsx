"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Gift, 
  TrendingUp 
} from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

interface SuperHeroBannerProps {
  featuredEvents: NormalizedEvent[];
}

export function SuperHeroBanner({ featuredEvents }: SuperHeroBannerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { selections, addSelection, removeSelection, setIsOpen } = useBetSlipStore();

  const currentMatch = featuredEvents[selectedIndex] ?? featuredEvents[0];
  if (!currentMatch) return null;

  const h2hMarket = currentMatch.markets.find((m) => m.key === "h2h") ?? currentMatch.markets[0];
  const totalsMarket = currentMatch.markets.find((m) => m.key === "totals" || m.name.includes("Total"));
  const overOutcome = totalsMarket?.outcomes.find((o) => o.name.toLowerCase().includes("over"));

  const outcomes = h2hMarket?.outcomes ?? [];
  const eventLabel = `${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`;

  const homeOutcome = outcomes.find((o) => o.name === currentMatch.homeTeam) ?? outcomes[0];
  const drawOutcome = outcomes.find((o) => o.name.toLowerCase().includes("draw"));
  const awayOutcome = outcomes.find((o) => o.name === currentMatch.awayTeam) ?? outcomes[outcomes.length - 1];

  const handleOddsClick = (
    market: typeof h2hMarket,
    outcome?: typeof homeOutcome
  ) => {
    if (!outcome || !market) return;
    const isSel = selections.some((s) => s.outcomeId === outcome.externalId);
    if (isSel) {
      removeSelection(outcome.externalId);
      return;
    }

    setIsOpen(true);
    addSelection({
      eventId: currentMatch.externalId,
      eventLabel,
      marketKey: market.key,
      marketName: market.name,
      outcomeId: outcome.externalId,
      outcomeName: outcome.name,
      bookmakerKey: market.bookmakerKey,
      price: outcome.price,
      point: outcome.point,
      commenceTime: currentMatch.commenceTime,
    });
  };

  const isSelected = (outcomeId?: string) => {
    if (!outcomeId) return false;
    return selections.some((s) => s.outcomeId === outcomeId);
  };

  const formattedDate = new Date(currentMatch.commenceTime).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 group">
      
      {/* Background Stadium Image with Rich Dark Gradient Glassmorphism */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: "url('/stadium-hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/70" />
      
      {/* Glowing Ambient Radial Light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between gap-6">
        
        {/* TOP BAR: Tag, League, Date, and Match Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>SUPER MATCH OF THE DAY</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentMatch.league}</span>
            </span>

            {currentMatch.isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-xs font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>LIVE {currentMatch.liveMinute ? `• ${currentMatch.liveMinute}` : ""}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>

          {/* Match Switcher Tabs */}
          {featuredEvents.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/80 border border-slate-800 p-1 rounded-2xl backdrop-blur-md">
              {featuredEvents.slice(0, 4).map((evt, idx) => {
                const isCurrent = selectedIndex === idx;
                return (
                  <button
                    key={evt.externalId}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      isCurrent
                        ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-850"
                    }`}
                  >
                    {evt.homeTeam.split(" ")[0]} vs {evt.awayTeam.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CENTER MATCH ARENA: Full Width Teams Display */}
        <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-4 py-2 my-auto">
          
          {/* Home Team */}
          <div className="sm:col-span-5 flex items-center justify-start sm:justify-end gap-3.5">
            <div className="flex flex-col text-left sm:text-right">
              <span className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentMatch.homeTeam}
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Home</span>
            </div>
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/40 text-xl font-black text-white shadow-xl shadow-emerald-950/50">
              {currentMatch.homeTeam[0]}
            </div>
          </div>

          {/* Center VS / Live Score */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center">
            {currentMatch.isLive && currentMatch.score ? (
              <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-wider">
                {currentMatch.score}
              </span>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 border border-slate-700 text-xs font-black text-slate-300 shadow-inner">
                VS
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="sm:col-span-5 flex items-center justify-start gap-3.5">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/40 text-xl font-black text-white shadow-xl shadow-cyan-950/50">
              {currentMatch.awayTeam[0]}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentMatch.awayTeam}
              </span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Away</span>
            </div>
          </div>

        </div>

        {/* DEDICATED CLEAN ODDS BAR */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {homeOutcome && (
              <button
                onClick={() => handleOddsClick(h2hMarket, homeOutcome)}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition border ${
                  isSelected(homeOutcome.externalId)
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-102"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-white hover:border-emerald-500/40"
                }`}
              >
                <span className="text-slate-300 font-semibold">{currentMatch.homeTeam} (1)</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{homeOutcome.price}</span>
              </button>
            )}

            {drawOutcome && (
              <button
                onClick={() => handleOddsClick(h2hMarket, drawOutcome)}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition border ${
                  isSelected(drawOutcome.externalId)
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-102"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-white hover:border-emerald-500/40"
                }`}
              >
                <span className="text-slate-300 font-semibold">Draw (X)</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{drawOutcome.price}</span>
              </button>
            )}

            {awayOutcome && (
              <button
                onClick={() => handleOddsClick(h2hMarket, awayOutcome)}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition border ${
                  isSelected(awayOutcome.externalId)
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-102"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-white hover:border-emerald-500/40"
                }`}
              >
                <span className="text-slate-300 font-semibold">{currentMatch.awayTeam} (2)</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{awayOutcome.price}</span>
              </button>
            )}

            <Link
              href={`/events/${currentMatch.externalId}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 px-4 py-2.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition shadow"
            >
              <span>+{currentMatch.markets.length} Markets</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

          </div>
        </div>

        {/* BOTTOM PROMOTIONAL BADGES */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Gift className="h-4 w-4" />
              <span>50 ETB Free Welcome Bonus</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <TrendingUp className="h-4 w-4" />
              <span>+50% Accumulator Boost</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Instant Telebirr & CBE Payouts</span>
            </span>
          </div>

          <Link
            href={`/events/${currentMatch.externalId}`}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group ml-auto"
          >
            <span>Explore All 24+ Markets</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
}
