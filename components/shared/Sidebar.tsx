"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  Trophy, 
  Activity, 
  ShieldAlert, 
  TrendingUp,
  CircleDot
} from "lucide-react";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex-col gap-4 hidden lg:flex">
      
      {/* Quick Navigation Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3 shadow-sm">
        <h3 className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Highlights
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
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
              5 LIVE
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
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Popular Events</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">74</span>
          </Link>
        </div>
      </div>

      {/* Top Leagues Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3 shadow-sm">
        <h3 className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Top Leagues & Competitions
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
          {SPORTS_CATEGORIES.map((cat) => {
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
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{cat.flag}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cat.count}
                </span>
              </Link>
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
