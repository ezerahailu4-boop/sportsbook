"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Flame, 
  Trophy, 
  Gift, 
  ShieldAlert, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  Globe2,
  Sparkles
} from "lucide-react";
import { SPORTS_CATEGORIES, POPULAR_LEAGUES, ALL_SPORT_GROUPS } from "@/lib/sports-constants";

export function Sidebar() {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Football");

  const toggleGroup = (group: string) => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-4 hidden lg:flex">
      
      {/* Quick Navigation Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3 shadow-sm">
        <h3 className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Highlights
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
          <Link
            href="/today"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
              pathname === "/today"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📅</span>
              <span>Today's Games</span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              TODAY
            </span>
          </Link>

          <Link
            href="/live"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
              pathname === "/live"
                ? "bg-red-500/15 text-red-400 border border-red-500/20"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Live In-Play</span>
            </div>
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 animate-pulse">
              LIVE
            </span>
          </Link>

          <Link
            href="/sports"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
              pathname === "/sports"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-emerald-400" />
              <span>All Sports & Leagues</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">230+</span>
          </Link>

          <Link
            href="/promotions"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
              pathname === "/promotions"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-amber-400" />
              <span>Acca Boosts & Promos</span>
            </div>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
              NEW
            </span>
          </Link>
        </div>
      </div>

      {/* Top Global Competitions */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3 shadow-sm">
        <div className="flex items-center justify-between px-3 py-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Featured Leagues</span>
          </h3>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {POPULAR_LEAGUES.map((cat) => {
            const href = `/sports/${cat.key}`;
            const isActive = pathname === href;
            return (
              <Link
                key={cat.key}
                href={href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm shrink-0">{cat.flag}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Sports A-Z with Expandable Categories */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3 shadow-sm">
        <h3 className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Sports Disciplines
        </h3>
        <div className="flex flex-col gap-1 mt-1">
          {ALL_SPORT_GROUPS.map((sg) => {
            const isExpanded = expandedGroup === sg.group;
            const leaguesInGroup = SPORTS_CATEGORIES.filter((c) => c.sportGroup === sg.group);

            return (
              <div key={sg.group} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleGroup(sg.group)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition text-left ${
                    isExpanded
                      ? "bg-slate-800/90 text-white"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{sg.flag}</span>
                    <span>{sg.group}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">{sg.count}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>
                </button>

                {isExpanded && leaguesInGroup.length > 0 && (
                  <div className="flex flex-col gap-0.5 ml-4 pl-2 border-l border-slate-800 mt-1 mb-1">
                    {leaguesInGroup.map((cat) => {
                      const href = `/sports/${cat.key}`;
                      const isActive = pathname === href;
                      return (
                        <Link
                          key={cat.key}
                          href={href}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-400 font-bold"
                              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">{cat.flag}</span>
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono ml-1 shrink-0">
                            {cat.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible Gaming Notice Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Play Responsibly</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Betting should be entertaining. Set deposit limits and take cooling-off breaks whenever you need.
        </p>
        <Link
          href="/responsible-gambling"
          className="inline-block mt-2.5 text-[11px] font-semibold text-emerald-400 hover:underline"
        >
          Manage Gambling Limits →
        </Link>
      </div>

    </aside>
  );
}
