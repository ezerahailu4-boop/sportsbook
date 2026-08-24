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
  TrendingUp, 
  Layers 
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
  const outcomes = h2hMarket?.outcomes ?? [];
  const eventLabel = `${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`;

  const homeOutcome = outcomes.find((o) => o.name === currentMatch.homeTeam) ?? outcomes[0];
  const drawOutcome = outcomes.find((o) => o.name.toLowerCase().includes("draw"));
  const awayOutcome = outcomes.find((o) => o.name === currentMatch.awayTeam) ?? outcomes[outcomes.length - 1];

  const handleOddsClick = (outcome: typeof homeOutcome) => {
    if (!outcome || !h2hMarket) return;
    const isSel = selections.some((s) => s.outcomeId === outcome.externalId);
    if (isSel) {
      removeSelection(outcome.externalId);
      return;
    }

    setIsOpen(true);
    addSelection({
      eventId: currentMatch.externalId,
      eventLabel,
      marketKey: h2hMarket.key,
      marketName: h2hMarket.name,
      outcomeId: outcome.externalId,
      outcomeName: outcome.name,
      bookmakerKey: h2hMarket.bookmakerKey,
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      
      {/* Glowing Ambient Radial Light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between gap-6 min-h-[360px]">
        
        {/* Top Header: Badge, League & Match Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              <span>SUPER MATCH OF THE DAY</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1 text-xs font-bold text-slate-300">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentMatch.league}</span>
            </span>

            {currentMatch.isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-xs font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>LIVE {currentMatch.liveMinute ? `• ${currentMatch.liveMinute}` : ""}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>

          {/* Match Switcher Tabs */}
          {featuredEvents.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/90 p-1 rounded-2xl backdrop-blur-md self-start sm:self-auto">
              {featuredEvents.slice(0, 4).map((evt, idx) => (
                <button
                  key={evt.externalId}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                    selectedIndex === idx
                      ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  {evt.homeTeam.split(" ")[0]} vs {evt.awayTeam.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Blockbuster Teams Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 my-auto">
          
          <div className="md:col-span-8 flex flex-col gap-4">
            
            {/* Team Matchup & Visual Badges */}
            <div className="flex items-center justify-start gap-4 sm:gap-6">
              
              {/* Home Team */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/40 text-xl font-black text-white shadow-xl shadow-emerald-950/50">
                  {currentMatch.homeTeam[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-black text-white leading-tight">
                    {currentMatch.homeTeam}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Home</span>
                </div>
              </div>

              {/* VS / Score Divider */}
              <div className="flex flex-col items-center justify-center px-2">
                {currentMatch.isLive && currentMatch.score ? (
                  <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-wider">
                    {currentMatch.score}
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 border border-slate-700 text-xs font-black text-slate-400">
                    VS
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/40 text-xl font-black text-white shadow-xl shadow-cyan-950/50">
                  {currentMatch.awayTeam[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-black text-white leading-tight">
                    {currentMatch.awayTeam}
                  </span>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Away</span>
                </div>
              </div>

            </div>

            {/* In-Banner Quick Odds Action */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>1-Click Odds:</span>
              </span>

              {homeOutcome && (
                <button
                  onClick={() => handleOddsClick(homeOutcome)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                    isSelected(homeOutcome.externalId)
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-105"
                      : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white hover:border-emerald-500/50"
                  }`}
                >
                  <span className="text-slate-400">{currentMatch.homeTeam} (1)</span>
                  <span className="font-mono text-emerald-400 font-black">{homeOutcome.price}</span>
                </button>
              )}

              {drawOutcome && (
                <button
                  onClick={() => handleOddsClick(drawOutcome)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                    isSelected(drawOutcome.externalId)
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-105"
                      : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white hover:border-emerald-500/50"
                  }`}
                >
                  <span className="text-slate-400">Draw (X)</span>
                  <span className="font-mono text-emerald-400 font-black">{drawOutcome.price}</span>
                </button>
              )}

              {awayOutcome && (
                <button
                  onClick={() => handleOddsClick(awayOutcome)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                    isSelected(awayOutcome.externalId)
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 font-black scale-105"
                      : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white hover:border-emerald-500/50"
                  }`}
                >
                  <span className="text-slate-400">{currentMatch.awayTeam} (2)</span>
                  <span className="font-mono text-emerald-400 font-black">{awayOutcome.price}</span>
                </button>
              )}

              <Link
                href={`/events/${currentMatch.externalId}`}
                className="flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition shadow"
              >
                <span>+{currentMatch.markets.length} Markets</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

          {/* Right Column: Promotional Highlight Cards */}
          <div className="md:col-span-4 flex flex-col gap-2.5">
            
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 p-3.5 backdrop-blur-md shadow-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Gift className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">50 ETB Free Welcome Bonus</span>
                  <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">FREE</span>
                </div>
                <span className="text-[11px] text-slate-400">Credited automatically upon registration.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 p-3.5 backdrop-blur-md shadow-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">+50% Accumulator Booster</span>
                  <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">BOOST</span>
                </div>
                <span className="text-[11px] text-slate-400">Extra cash multiplier on 3+ match slips.</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Feature Badges */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official Telebirr & CBE Verified</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Instant Payouts & Settlement</span>
            </span>
          </div>

          <Link
            href={`/events/${currentMatch.externalId}`}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>Explore All 24+ Markets for {currentMatch.homeTeam} vs {currentMatch.awayTeam}</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
}
