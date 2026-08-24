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
  ShieldCheck 
} from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";

interface HighlightMatch {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  league: string;
  timeLabel: string;
  photoUrl: string;
  homeTeam: string;
  awayTeam: string;
  eventId: string;
  odds: {
    home: string;
    draw: string;
    away: string;
  };
  marketCount: number;
  period: "TODAY" | "WEEKEND";
}

const FEATURED_BIG_MATCHES: HighlightMatch[] = [
  {
    id: "match_london_derby",
    tag: "🔥 LONDON DERBY",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    title: "Chelsea vs Tottenham Hotspur",
    league: "English Premier League",
    timeLabel: "Today • 20:00 EAT",
    photoUrl: "/match-london-derby.jpg",
    homeTeam: "Chelsea",
    awayTeam: "Tottenham",
    eventId: "epl_chelsea_tottenham_2026",
    odds: {
      home: "1.92",
      draw: "3.75",
      away: "3.80",
    },
    marketCount: 24,
    period: "TODAY",
  },
  {
    id: "match_el_clasico",
    tag: "👑 EL CLÁSICO",
    tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    title: "Real Madrid vs Barcelona",
    league: "Spanish La Liga",
    timeLabel: "Sunday • 21:00 EAT",
    photoUrl: "/match-el-clasico.jpg",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    eventId: "laliga_madrid_barca_2026",
    odds: {
      home: "2.15",
      draw: "3.60",
      away: "3.10",
    },
    marketCount: 26,
    period: "WEEKEND",
  },
  {
    id: "match_ucl_clash",
    tag: "🏆 EUROPEAN BLOCKBUSTER",
    tagColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
    title: "Bayern Munich vs Real Madrid",
    league: "UEFA Champions League",
    timeLabel: "Wednesday • 22:00 EAT",
    photoUrl: "/match-ucl.jpg",
    homeTeam: "Bayern Munich",
    awayTeam: "Real Madrid",
    eventId: "ucl_bayern_madrid_2026",
    odds: {
      home: "2.40",
      draw: "3.50",
      away: "2.85",
    },
    marketCount: 28,
    period: "WEEKEND",
  },
  {
    id: "match_ethiopian_derby",
    tag: "🦁 SHEGER SUPER DERBY",
    tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    title: "Saint George SC vs Ethiopian Coffee SC",
    league: "Ethiopian Premier League",
    timeLabel: "Saturday • 16:00 EAT",
    photoUrl: "/match-ethiopian-derby.jpg",
    homeTeam: "Saint George SC",
    awayTeam: "Ethiopian Coffee",
    eventId: "epl_ethiopia_derby_2026",
    odds: {
      home: "2.10",
      draw: "3.20",
      away: "3.40",
    },
    marketCount: 20,
    period: "WEEKEND",
  },
];

export function BigMatchesShowcase() {
  const [filter, setFilter] = useState<"ALL" | "TODAY" | "WEEKEND">("ALL");
  const { selections, addSelection, removeSelection, setIsOpen } = useBetSlipStore();

  const handleOddsClick = (match: HighlightMatch, choice: "home" | "draw" | "away", price: string, label: string) => {
    const outcomeId = `${match.eventId}:h2h:${choice}`;
    const isSel = selections.some((s) => s.outcomeId === outcomeId);
    if (isSel) {
      removeSelection(outcomeId);
      return;
    }

    setIsOpen(true);
    addSelection({
      eventId: match.eventId,
      eventLabel: `${match.homeTeam} vs ${match.awayTeam}`,
      marketKey: "h2h",
      marketName: "Match Result (1X2)",
      outcomeId,
      outcomeName: label,
      bookmakerKey: "draftkings_official",
      price,
      point: null,
      commenceTime: new Date().toISOString(),
    });
  };

  const isSelected = (outcomeId: string) => selections.some((s) => s.outcomeId === outcomeId);

  const filteredMatches = FEATURED_BIG_MATCHES.filter((m) => {
    if (filter === "ALL") return true;
    return m.period === filter;
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            Today & Weekend Big Match Highlights
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { id: "ALL", label: "⚡ All Super Matches" },
            { id: "TODAY", label: "🔥 Today's Headliners" },
            { id: "WEEKEND", label: "🗓️ Weekend Clashes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filter === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Big Match Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map((match) => {
          const homeOutcomeId = `${match.eventId}:h2h:home`;
          const drawOutcomeId = `${match.eventId}:h2h:draw`;
          const awayOutcomeId = `${match.eventId}:h2h:away`;

          return (
            <div
              key={match.id}
              className="relative rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 shadow-2xl transition-all duration-300 group min-h-[260px] flex flex-col justify-between p-5"
            >
              {/* Background Match Action Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${match.photoUrl}')` }}
              />
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Card Top: Badges */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider border shadow-md ${match.tagColor}`}>
                    {match.tag}
                  </span>
                  <span className="rounded-full bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                    {match.league}
                  </span>
                </div>

                <span className="flex items-center gap-1 rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold backdrop-blur-md">
                  <Clock className="h-3 w-3" />
                  <span>{match.timeLabel}</span>
                </span>
              </div>

              {/* Card Bottom: Match Title & Odds Grid */}
              <div className="relative z-10 flex flex-col gap-3 pt-12">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md group-hover:text-emerald-400 transition-colors">
                    {match.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 drop-shadow flex items-center gap-2 mt-0.5">
                    <span>{match.homeTeam} (Home)</span>
                    <span>vs</span>
                    <span>{match.awayTeam} (Away)</span>
                  </p>
                </div>

                {/* 1X2 Odds Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOddsClick(match, "home", match.odds.home, match.homeTeam)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                      isSelected(homeOutcomeId)
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                        : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                    }`}
                  >
                    <span className="text-slate-400 text-[11px]">1</span>
                    <span className="font-mono text-emerald-400 font-black">{match.odds.home}</span>
                  </button>

                  <button
                    onClick={() => handleOddsClick(match, "draw", match.odds.draw, "Draw")}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                      isSelected(drawOutcomeId)
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                        : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                    }`}
                  >
                    <span className="text-slate-400 text-[11px]">X</span>
                    <span className="font-mono text-emerald-400 font-black">{match.odds.draw}</span>
                  </button>

                  <button
                    onClick={() => handleOddsClick(match, "away", match.odds.away, match.awayTeam)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition border ${
                      isSelected(awayOutcomeId)
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black"
                        : "bg-slate-950/85 hover:bg-slate-900 border-slate-800 text-white hover:border-emerald-500/40 backdrop-blur-md"
                    }`}
                  >
                    <span className="text-slate-400 text-[11px]">2</span>
                    <span className="font-mono text-emerald-400 font-black">{match.odds.away}</span>
                  </button>
                </div>

                {/* Footer link */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Real-Time Odds</span>
                  </span>
                  <Link
                    href={`/events/${match.eventId}`}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>+{match.marketCount} Markets</span>
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
