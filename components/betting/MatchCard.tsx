"use client";

import Link from "next/link";
import { ChevronRight, Flame, Clock, Radio } from "lucide-react";
import { OddsButton } from "@/components/betting/OddsButton";

interface Outcome {
  outcomeId: string;
  name: string;
  price: string;
  point: string | null;
}

interface Market {
  key: string;
  name: string;
  bookmakerKey: string;
  outcomes: Outcome[];
}

interface MatchCardProps {
  eventId: string;
  sportKey?: string;
  league: string | null;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  isLive: boolean;
  liveMinute?: string;
  score?: string;
  marketCount?: number;
  mainMarket: Market | null;
  lastUpdatedSecondsAgo: number;
}

export function MatchCard({
  eventId,
  league,
  homeTeam,
  awayTeam,
  commenceTime,
  isLive,
  liveMinute,
  score,
  marketCount = 6,
  mainMarket,
  lastUpdatedSecondsAgo,
}: MatchCardProps) {
  const eventLabel = `${homeTeam} vs ${awayTeam}`;

  const formattedDate = new Date(commenceTime).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 group relative overflow-hidden">
      
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400 text-[11px] truncate max-w-[200px]">
            {league ?? "Sportsbook Match"}
          </span>
        </div>

        {isLive ? (
          <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE {liveMinute ? `• ${liveMinute}` : ""}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Teams & Score Section */}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/events/${eventId}`} className="flex flex-col gap-1.5 flex-1 hover:opacity-90 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
              {homeTeam}
            </span>
            {isLive && score && (
              <span className="text-sm font-black font-mono text-emerald-400">
                {score.split("-")[0]?.trim()}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
              {awayTeam}
            </span>
            {isLive && score && (
              <span className="text-sm font-black font-mono text-emerald-400">
                {score.split("-")[1]?.trim()}
              </span>
            )}
          </div>
        </Link>

        {/* Link to all markets */}
        <Link
          href={`/events/${eventId}`}
          className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition"
        >
          <span>+{marketCount}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Odds Buttons */}
      {mainMarket && mainMarket.outcomes.length > 0 ? (
        <div className="flex items-center gap-2 pt-1">
          {mainMarket.outcomes.map((o) => (
            <OddsButton
              key={o.outcomeId}
              eventId={eventId}
              eventLabel={eventLabel}
              marketKey={mainMarket.key}
              marketName={mainMarket.name}
              outcomeId={o.outcomeId}
              outcomeName={o.name}
              bookmakerKey={mainMarket.bookmakerKey}
              price={o.price}
              point={o.point}
              commenceTime={commenceTime}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900/60 p-2 text-center text-xs text-slate-500">
          Odds refreshing...
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
        <span className="flex items-center gap-1">
          <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse" />
          <span>Odds updated {lastUpdatedSecondsAgo}s ago</span>
        </span>
        <Link href={`/events/${eventId}`} className="sm:hidden text-emerald-400 font-medium">
          More markets →
        </Link>
      </div>

    </div>
  );
}
