import Link from "next/link";
import { Trophy, ChevronRight, Activity, Flame } from "lucide-react";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";
import { Sidebar } from "@/components/shared/Sidebar";
import { BetSlip } from "@/components/betting/BetSlip";

export default function SportsOverviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">All Sports & Leagues</h1>
              <p className="text-xs text-slate-400">Browse world competitions and pre-match odds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {SPORTS_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/sports/${cat.key}`}
                className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">{cat.sport}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono font-semibold text-slate-300">
                    {cat.count}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition" />
                </div>
              </Link>
            ))}
          </div>

        </div>

        <BetSlip />
      </div>
    </div>
  );
}
