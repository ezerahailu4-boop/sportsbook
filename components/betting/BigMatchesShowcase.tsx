"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Calendar, 
  Zap, 
  ShieldCheck,
  Radio
} from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

interface BigMatchesShowcaseProps {
  events: NormalizedEvent[];
}

export function BigMatchesShowcase({ events }: BigMatchesShowcaseProps) {
  const [filter, setFilter] = useState<"ALL" | "TODAY" | "WEEKEND">("ALL");
  const { selections, addSelection, removeSelection, setIsOpen } = useBetSlipStore();

  if (!events || events.length === 0) return null;

  // Map real events to rich photo cards
  const matches = events.slice(0, 6).map((event, idx) => {
    const h2h = event.markets.find((m) => m.key === "h2h") ?? event.markets[0];
    const outcomes = h2h?.outcomes ?? [];
    
    const homeOutcome = outcomes.find((o) => o.name === event.homeTeam) ?? outcomes[0];
    const drawOutcome = outcomes.find((o) => o.name.toLowerCase().includes("draw"));
    const awayOutcome = outcomes.find((o) => o.name === event.awayTeam) ?? outcomes[outcomes.length - 1];

    // Pick visual background photo based on league
    let photoUrl = "/match-london-derby.jpg";
    let tag = "🔥 PREMIER LEAGUE CLASH";
    let tagColor = "bg-blue-500/20 text-blue-400 border-blue-500/40";

    const lk = (event.league || "").toLowerCase();
    if (lk.includes("champions") || lk.includes("uefa")) {
      photoUrl = "/match-ucl.jpg";
      tag = "🏆 EUROPEAN BLOCKBUSTER";
      tagColor = "bg-indigo-500/20 text-indigo-400 border-indigo-500/40";
    } else if (lk.includes("la liga") || lk.includes("spain")) {
      photoUrl = "/match-el-clasico.jpg";
      tag = "👑 LA LIGA HEADLINER";
      tagColor = "bg-amber-500/20 text-amber-400 border-amber-500/40";
    } else if (lk.includes("ethiopia") || event.homeTeam.includes("Saint George") || event.homeTeam.includes("Coffee")) {
      photoUrl = "/match-ethiopian-derby.jpg";
      tag = "🦁 SHEGER SUPER DERBY";
      tagColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    } else if (idx % 3 === 1) {
      photoUrl = "/match-el-clasico.jpg";
      tag = "⚡ SUPER MATCH HIGHLIGHT";
      tagColor = "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
    } else if (idx % 3 === 2) {
      photoUrl = "/match-ucl.jpg";
      tag = "⭐ TOP FIXTURE";
      tagColor = "bg-purple-500/20 text-purple-400 border-purple-500/40";
    }

    const eventDate = new Date(event.commenceTime);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString() || event.isLive;
    const period: "TODAY" | "WEEKEND" = isToday ? "TODAY" : "WEEKEND";

    const timeLabel = event.isLive
      ? `LIVE ${event.liveMinute ? `• ${event.liveMinute}` : ""}`
      : eventDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    return {
      event,
      h2h,
      homeOutcome,
      drawOutcome,
      awayOutcome,
      photoUrl,
      tag,
      tagColor,
      timeLabel,
      period,
    };
  });

  const handleOddsClick = (
    event: NormalizedEvent,
    market: typeof matches[0]["h2h"],
    outcome?: typeof matches[0]["homeOutcome"]
  ) => {
    if (!outcome || !market) return;
    const isSel = selections.some((s) => s.outcomeId === outcome.externalId);
    if (isSel) {
      removeSelection(outcome.externalId);
      return;
    }

    setIsOpen(true);
    addSelection({
      eventId: event.externalId,
      eventLabel: `${event.homeTeam} vs ${event.awayTeam}`,
      marketKey: market.key,
      marketName: market.name,
      outcomeId: outcome.externalId,
      outcomeName: outcome.name,
      bookmakerKey: market.bookmakerKey,
      price: outcome.price,
      point: outcome.point,
      commenceTime: event.commenceTime,
    });
  };

  const isSelected = (outcomeId?: string) => {
    if (!outcomeId) return false;
    return selections.some((s) => s.outcomeId === outcomeId);
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === "ALL") return true;
    return m.period === filter;
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Section Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            Today & Weekend Real Big Matches
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { id: "ALL", label: `⚡ All Matches (${matches.length})` },
            { id: "TODAY", label: "🔥 Today's Games" },
            { id: "WEEKEND", label: "🗓️ Upcoming Schedule" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filter === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Big Match Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map(({ event, h2h, homeOutcome, drawOutcome, awayOutcome, photoUrl, tag, tagColor, timeLabel }) => {
          return (
            <div
              key={event.externalId}
              className="relative rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 shadow-2xl transition-all duration-300 group min-h-[260px] flex flex-col justify-between p-5"
            >
              {/* Real Match Action Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${photoUrl}')` }}
              />
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Card Top: League Badge & Kickoff Time */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider border shadow-md ${tagColor}`}>
                    {tag}
                  </span>
                  <span className="rounded-full bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                    {event.league}
                  </span>
                </div>

                {event.isLive ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    <span>{timeLabel}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold backdrop-blur-md">
                    <Clock className="h-3 w-3" />
                    <span>{timeLabel}</span>
                  </span>
                )}
              </div>

              {/* Card Bottom: Team Names & Real Odds Grid */}
              <div className="relative z-10 flex flex-col gap-3 pt-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md group-hover:text-emerald-400 transition-colors">
                    {event.homeTeam} vs {event.awayTeam}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 drop-shadow mt-0.5">
                    <span className="font-semibold">{event.homeTeam} (Home)</span>
                    <span>•</span>
                    <span className="font-semibold">{event.awayTeam} (Away)</span>
                    {event.isLive && event.score && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-black text-emerald-400">{event.score}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Real 1X2 Odds Chips */}
                <div className="grid grid-cols-3 gap-2">
                  {homeOutcome ? (
                    <button
                      onClick={() => handleOddsClick(event, h2h, homeOutcome)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                        isSelected(homeOutcome.externalId)
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                          : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                      }`}
                    >
                      <span className="text-slate-400 text-[11px]">1</span>
                      <span className="font-mono text-emerald-400 font-black">{homeOutcome.price}</span>
                    </button>
                  ) : (
                    <div className="rounded-xl bg-slate-900/50 p-2 text-center text-slate-600 text-xs">-</div>
                  )}

                  {drawOutcome ? (
                    <button
                      onClick={() => handleOddsClick(event, h2h, drawOutcome)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                        isSelected(drawOutcome.externalId)
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                          : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                      }`}
                    >
                      <span className="text-slate-400 text-[11px]">X</span>
                      <span className="font-mono text-emerald-400 font-black">{drawOutcome.price}</span>
                    </button>
                  ) : (
                    <div className="rounded-xl bg-slate-900/50 p-2 text-center text-slate-600 text-xs">-</div>
                  )}

                  {awayOutcome ? (
                    <button
                      onClick={() => handleOddsClick(event, h2h, awayOutcome)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                        isSelected(awayOutcome.externalId)
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                          : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                      }`}
                    >
                      <span className="text-slate-400 text-[11px]">2</span>
                      <span className="font-mono text-emerald-400 font-black">{awayOutcome.price}</span>
                    </button>
                  ) : (
                    <div className="rounded-xl bg-slate-900/50 p-2 text-center text-slate-600 text-xs">-</div>
                  )}
                </div>

                {/* Footer link to real event markets */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                    <span>Real Bookmaker Feed</span>
                  </span>
                  <Link
                    href={`/events/${event.externalId}`}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>+{event.markets.length} Markets</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
