"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Flame, Zap, Activity } from "lucide-react";

const TOP_LEAGUES = [
  { id: "soccer_epl", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", icon: "⚽", matches: "21", href: "/sports/soccer_epl" },
  { id: "soccer_uefa_champs_league", name: "Champions League", flag: "🏆", icon: "⭐", matches: "40", href: "/sports/soccer_uefa_champs_league" },
  { id: "soccer_spain_la_liga", name: "La Liga", flag: "🇪🇸", icon: "⚽", matches: "27", href: "/sports/soccer_spain_la_liga" },
  { id: "soccer_germany_bundesliga", name: "Bundesliga", flag: "🇩🇪", icon: "⚽", matches: "18", href: "/sports/soccer_germany_bundesliga" },
  { id: "soccer_italy_serie_a", name: "Serie A", flag: "🇮🇹", icon: "⚽", matches: "22", href: "/sports/soccer_italy_serie_a" },
  { id: "soccer_ethiopian_premier_league", name: "Ethiopian League", flag: "🇪🇹", icon: "🦁", matches: "16", href: "/sports/soccer_epl" },
  { id: "basketball_nba", name: "NBA Basketball", flag: "🇺🇸", icon: "🏀", matches: "12", href: "/sports/basketball_nba" },
];

export function TopLeaguesBar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span>Top Competitions & Tournaments</span>
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TOP_LEAGUES.map((league) => {
          const isActive = pathname === league.href;
          return (
            <Link
              key={league.id}
              href={league.href}
              className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap border shadow-sm ${
                isActive
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-emerald-500/20"
                  : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800 hover:border-slate-700"
              }`}
            >
              <span className="text-sm">{league.flag}</span>
              <span>{league.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-slate-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                {league.matches}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
