"use client";

import Link from "next/link";
import { Flame, ChevronRight, Activity } from "lucide-react";
import { OddsButton } from "@/components/betting/OddsButton";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

interface LiveMatchCardProps {
  event: NormalizedEvent;
}

export function LiveMatchCard({ event }: LiveMatchCardProps) {
  const eventLabel = `${event.homeTeam} vs ${event.awayTeam}`;
  const mainMarket = event.markets.find((m) => m.key === "h2h") ?? event.markets[0] ?? null;

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-3.5 border-l-4 border-l-red-500 relative">
      
      {/* Live Header Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
            {event.liveMinute ?? "LIVE"}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-semibold text-slate-400 truncate max-w-[180px]">
            {event.league ?? event.sportTitle}
          </span>
        </div>

        <Link
          href={`/events/${event.externalId}`}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <span>All Markets</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Match Score & Teams */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm font-bold text-white">{event.homeTeam}</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {event.score ? event.score.split("-")[0]?.trim() : "0"}
            </span>
          </div>
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm font-bold text-white">{event.awayTeam}</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {event.score ? event.score.split("-")[1]?.trim() : "0"}
            </span>
          </div>
        </div>
      </div>

      {/* 1X2 / Moneyline Odds */}
      {mainMarket && (
        <div className="flex items-center gap-2 pt-1">
          {mainMarket.outcomes.map((o) => (
            <OddsButton
              key={o.externalId}
              eventId={event.externalId}
              eventLabel={eventLabel}
              marketKey={mainMarket.key}
              marketName={mainMarket.name}
              outcomeId={o.externalId}
              outcomeName={o.name}
              bookmakerKey={mainMarket.bookmakerKey}
              price={o.price}
              point={o.point}
              commenceTime={event.commenceTime}
            />
          ))}
        </div>
      )}

    </div>
  );
}
