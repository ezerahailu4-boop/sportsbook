"use client";

import { useState } from "react";
import { Search, Flame, Radio, Layers } from "lucide-react";
import { LiveMatchCard } from "@/components/betting/LiveMatchCard";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

interface LiveMatchCenterProps {
  events: NormalizedEvent[];
}

const SPORT_FILTERS = [
  { id: "all", label: "All Live", flag: "🔥" },
  { id: "soccer", label: "Football", flag: "⚽" },
  { id: "basketball", label: "Basketball", flag: "🏀" },
  { id: "tennis", label: "Tennis", flag: "🎾" },
  { id: "baseball", label: "Baseball", flag: "⚾" },
  { id: "icehockey", label: "Ice Hockey", flag: "🏒" },
  { id: "cricket", label: "Cricket", flag: "🏏" },
];

export function LiveMatchCenter({ events }: LiveMatchCenterProps) {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEvents = events.filter((e) => {
    // Sport match
    if (selectedSport !== "all") {
      if (!e.sportKey.startsWith(selectedSport)) {
        return false;
      }
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeams = e.homeTeam.toLowerCase().includes(q) || e.awayTeam.toLowerCase().includes(q);
      const matchLeague = (e.league || "").toLowerCase().includes(q);
      return matchTeams || matchLeague;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Sport Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SPORT_FILTERS.map((filter) => {
            const count =
              filter.id === "all"
                ? events.length
                : events.filter((e) => e.sportKey.startsWith(filter.id)).length;

            if (count === 0 && filter.id !== "all") return null;

            const isActive = selectedSport === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedSport(filter.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{filter.flag}</span>
                <span>{filter.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-black/30 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Bar */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search live teams..."
            className="w-full rounded-xl bg-slate-900/90 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Grid of Live Match Cards */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold text-slate-300">No live matches matching your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try switching sport filters or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEvents.map((event) => (
            <LiveMatchCard key={event.externalId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
