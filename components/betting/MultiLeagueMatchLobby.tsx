"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Flame, 
  Radio, 
  Layers, 
  SlidersHorizontal 
} from "lucide-react";
import { MatchCard } from "@/components/betting/MatchCard";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

interface LeagueGroup {
  id: string;
  name: string;
  flag: string;
  events: NormalizedEvent[];
}

interface MultiLeagueMatchLobbyProps {
  leagueGroups: LeagueGroup[];
}

export function MultiLeagueMatchLobby({ leagueGroups }: MultiLeagueMatchLobbyProps) {
  const [activeLeague, setActiveLeague] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    leagueGroups.forEach((g) => {
      init[g.id] = true; // all expanded by default
    });
    return init;
  });

  const totalMatchesCount = useMemo(() => {
    return leagueGroups.reduce((acc, g) => acc + g.events.length, 0);
  }, [leagueGroups]);

  const toggleLeague = (id: string) => {
    setExpandedLeagues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGroups = useMemo(() => {
    return leagueGroups
      .map((g) => {
        if (activeLeague !== "ALL" && g.id !== activeLeague) {
          return null;
        }

        let filteredEvents = g.events;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filteredEvents = filteredEvents.filter(
            (e) =>
              (e.homeTeam || "").toLowerCase().includes(q) ||
              (e.awayTeam || "").toLowerCase().includes(q) ||
              (e.league || "").toLowerCase().includes(q)
          );
        }

        if (filteredEvents.length === 0) return null;

        return {
          ...g,
          events: filteredEvents,
        };
      })
      .filter((g): g is LeagueGroup => g !== null);
  }, [leagueGroups, activeLeague, searchQuery]);

  return (
    <div className="flex flex-col gap-5">
      
      {/* Header, Search & Filter Bar */}
      <div className="flex flex-col gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Global Match Lobby & Fixtures
            </h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-black text-emerald-400">
              {totalMatchesCount} Live Matches
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search any team or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* League Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => setActiveLeague("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              activeLeague === "ALL"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800/80"
            }`}
          >
            🌐 All Competitions ({totalMatchesCount})
          </button>

          {leagueGroups.map((g) => {
            const isSelected = activeLeague === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveLeague(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800/80"
                }`}
              >
                <span>{g.flag}</span>
                <span>{g.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                    isSelected ? "bg-slate-950 text-emerald-400" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {g.events.length}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Grouped Leagues Accordions */}
      {filteredGroups.length === 0 ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-500 text-xs">
          No matches found matching your search. Try another team name.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredGroups.map((group) => {
            const isExpanded = expandedLeagues[group.id] ?? true;
            return (
              <div
                key={group.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden"
              >
                {/* League Header */}
                <div
                  onClick={() => toggleLeague(group.id)}
                  className="flex items-center justify-between p-4 bg-slate-950/60 border-b border-slate-800/80 cursor-pointer hover:bg-slate-850/50 transition select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{group.flag}</span>
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span>{group.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({group.events.length} Fixtures)
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sports/${group.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline px-2 py-1"
                    >
                      <span>View Standings & Odds</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Matches List */}
                {isExpanded && (
                  <div className="p-3 flex flex-col gap-2.5">
                    {group.events.map((event) => {
                      const mainMarket =
                        event.markets.find((m) => m.key === "h2h") ?? event.markets[0] ?? null;

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
                          lastUpdatedSecondsAgo={10}
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
            );
          })}
        </div>
      )}

    </div>
  );
}
