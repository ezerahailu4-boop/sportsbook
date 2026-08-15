"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Trophy, ChevronRight, Globe2, Sparkles, Star } from "lucide-react";
import { SPORTS_CATEGORIES, ALL_SPORT_GROUPS, POPULAR_LEAGUES } from "@/lib/sports-constants";

export function SportsDirectory() {
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCategories = SPORTS_CATEGORIES.filter((cat) => {
    if (selectedGroup !== "All" && cat.sportGroup !== selectedGroup) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cat.name.toLowerCase().includes(q);
      const matchSport = cat.sport.toLowerCase().includes(q);
      const matchCountry = cat.country.toLowerCase().includes(q);
      return matchName || matchSport || matchCountry;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header & Instant Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-emerald-400" />
            <span>Worldwide Sports & Leagues</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse international competitions, tournament brackets, and live market odds
          </p>
        </div>

        {/* Global Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search league, country or sport..."
            className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Sport Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedGroup("All")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
            selectedGroup === "All"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>🌍</span>
          <span>All Disciplines</span>
        </button>

        {ALL_SPORT_GROUPS.map((group) => {
          const isActive = selectedGroup === group.group;
          return (
            <button
              key={group.group}
              type="button"
              onClick={() => setSelectedGroup(group.group)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{group.flag}</span>
              <span>{group.group}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}
              >
                {group.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Featured / Popular Highlights (Only shown on "All" without search) */}
      {selectedGroup === "All" && !searchQuery.trim() && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>Top Tier Global Competitions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_LEAGUES.slice(0, 4).map((cat) => (
              <Link
                key={cat.key}
                href={`/sports/${cat.key}`}
                className="group rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 hover:border-emerald-500/40 hover:shadow-lg transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{cat.flag}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{cat.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/20">
                    {cat.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Worldwide Competitions Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300">
            {selectedGroup === "All" ? "All Competitions" : `${selectedGroup} Leagues`}
            <span className="text-slate-500 text-xs font-normal ml-2">
              ({filteredCategories.length} leagues available)
            </span>
          </h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center text-slate-500">
            <p className="text-sm font-semibold text-slate-300">No competitions found matching "{searchQuery}".</p>
            <p className="text-xs text-slate-500 mt-1">Try another search term or select a different sport category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredCategories.map((cat) => (
              <Link
                key={cat.key}
                href={`/sports/${cat.key}`}
                className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/40 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{cat.flag}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{cat.sport}</span>
                      <span>•</span>
                      <span className="text-slate-500">{cat.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="rounded-full bg-slate-800/90 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-300 border border-slate-700/50">
                    {cat.count}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
