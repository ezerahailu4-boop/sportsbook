"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, ArrowLeft, TrendingUp, TrendingDown, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminOddsMonitorPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/odds/sync", { method: "POST" });
      const json = await res.json();
      setSyncResult(json);
    } catch (err) {
      setSyncResult({ success: false, error: (err as Error).message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Operations Center</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Radio className="h-6 w-6 text-emerald-400 animate-pulse" />
            <span>Live Odds Stream & Market Feed</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized real-time prices from The Odds API v4 (Pinnacle, Bet365, FanDuel, DraftKings).
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Fetching Live Data..." : "Fetch & Sync All Odds Now"}</span>
        </button>
      </div>

      {/* Sync Report Banner */}
      {syncResult && (
        <div className={`rounded-2xl border p-4 text-xs ${
          syncResult.success
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
            : "bg-red-950/40 border-red-500/40 text-red-300"
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1.5">
            {syncResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span>{syncResult.success ? "Odds Feed Synchronized Successfully" : "Sync Failed"}</span>
          </div>
          {syncResult.data?.results && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-800/40">
              {syncResult.data.results.map((r: any) => (
                <div key={r.sport} className="rounded-lg bg-slate-900/80 px-2.5 py-1.5 flex justify-between">
                  <span className="font-mono text-slate-300">{r.sport.replace("soccer_", "").replace("_", " ")}</span>
                  <span className="font-bold text-white">{r.eventCount} Matches</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Odds Stream Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Live Bookmaker Feed
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="pb-3 pl-2">Event</th>
                <th className="pb-3">Market</th>
                <th className="pb-3">Selection</th>
                <th className="pb-3">Current Odds</th>
                <th className="pb-3">Movement</th>
                <th className="pb-3 pr-2 text-right">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 pl-2 font-bold text-white">
                  <p>Manchester City vs Liverpool</p>
                  <span className="text-[10px] text-emerald-400 font-normal">Live 64&apos; (2 - 1)</span>
                </td>
                <td className="py-3 text-slate-300 font-semibold">1X2 (Match Winner)</td>
                <td className="py-3 text-white font-semibold">Manchester City</td>
                <td className="py-3 font-bold font-mono text-emerald-400 tabular-nums text-sm">1.62</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" /> +Drift
                  </span>
                </td>
                <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">The Odds API v4</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 pl-2 font-bold text-white">
                  <p>Real Madrid vs Barcelona</p>
                  <span className="text-[10px] text-emerald-400 font-normal">Live 38&apos; (1 - 1)</span>
                </td>
                <td className="py-3 text-slate-300 font-semibold">Both Teams To Score</td>
                <td className="py-3 text-white font-semibold">Yes</td>
                <td className="py-3 font-bold font-mono text-emerald-400 tabular-nums text-sm">1.50</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400">
                    <TrendingDown className="h-3.5 w-3.5" /> -Shortened
                  </span>
                </td>
                <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">The Odds API v4</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 pl-2 font-bold text-white">
                  <p>Boston Celtics vs LA Lakers</p>
                  <span className="text-[10px] text-slate-400 font-normal">NBA Basketball</span>
                </td>
                <td className="py-3 text-slate-300 font-semibold">Over/Under Totals</td>
                <td className="py-3 text-white font-semibold">Over 224.5</td>
                <td className="py-3 font-bold font-mono text-emerald-400 tabular-nums text-sm">1.91</td>
                <td className="py-3">
                  <span className="text-[11px] font-mono text-slate-500">Unchanged</span>
                </td>
                <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">The Odds API v4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
