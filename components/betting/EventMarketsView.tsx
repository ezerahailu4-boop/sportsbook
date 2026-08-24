"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Sparkles, Trophy, Flame, Layers } from "lucide-react";
import { MarketCard } from "@/components/betting/MarketCard";
import type { NormalizedMarket } from "@/services/odds/odds-normalizer";

interface EventMarketsViewProps {
  markets: NormalizedMarket[];
  eventId: string;
  eventLabel: string;
  commenceTime: string;
}

const CATEGORIES = [
  { id: "ALL", label: "🌐 All Markets" },
  { id: "MAIN", label: "🏆 Main / 1X2" },
  { id: "GOALS", label: "⚽ Goals & Totals" },
  { id: "HALVES", label: "⏱️ Halves & HT/FT" },
  { id: "SCORE", label: "🔢 Correct Score" },
  { id: "HANDICAP", label: "📊 Handicap & Spreads" },
  { id: "SPECIALS", label: "⚡ Specials & Combos" },
];

export function EventMarketsView({
  markets,
  eventId,
  eventLabel,
  commenceTime,
}: EventMarketsViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesOutcome = m.outcomes.some((o) => o.name.toLowerCase().includes(q));
        if (!matchesName && !matchesOutcome) return false;
      }

      // Category filter
      if (activeCategory === "ALL") return true;

      if (activeCategory === "MAIN") {
        return ["h2h", "double_chance", "btts", "draw_no_bet"].includes(m.key);
      }

      if (activeCategory === "GOALS") {
        return (
          m.key.startsWith("totals") ||
          m.key === "goals_odd_even" ||
          m.key.includes("team_totals") ||
          m.key === "first_team_to_score"
        );
      }

      if (activeCategory === "HALVES") {
        return (
          m.key.includes("half") ||
          m.key === "highest_scoring_half" ||
          m.key === "ht_ft"
        );
      }

      if (activeCategory === "SCORE") {
        return m.key === "correct_score";
      }

      if (activeCategory === "HANDICAP") {
        return m.key === "spreads" || m.key.includes("handicap");
      }

      if (activeCategory === "SPECIALS") {
        return [
          "clean_sheet",
          "win_to_nil",
          "win_either_half",
          "first_team_to_score",
        ].includes(m.key);
      }

      return true;
    });
  }, [markets, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-lg">
        
        {/* Horizontal Category Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Market Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter market or line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Markets Count Indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
          Showing {filteredMarkets.length} of {markets.length} Betting Markets
        </span>
      </div>

      {/* Markets Cards Grid */}
      {filteredMarkets.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 text-xs">
          No betting markets found matching your search.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.key}
              market={market}
              eventId={eventId}
              eventLabel={eventLabel}
              commenceTime={commenceTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
