"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Receipt, Trophy, Flame, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api-client";

interface BetSelectionItem {
  id: string;
  selectionName: string;
  oddsAtPlacement: string;
  point: string | null;
  marketKey: string;
  status: string;
  event: {
    homeTeam: string;
    awayTeam: string;
    league: string | null;
    commenceTime: string;
  } | null;
}

interface BetItem {
  id: string;
  betType: string;
  stake: string;
  combinedOdds: string;
  potentialReturn: string;
  potentialProfit: string;
  status: "PENDING" | "WON" | "LOST" | "VOID" | "CANCELLED";
  placedAt: string;
  settledAt: string | null;
  selections: BetSelectionItem[];
}

export default function BetHistoryPage() {
  const { user, openAuthModal } = useAuthStore();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "WON" | "LOST">("ALL");
  const [bets, setBets] = useState<BetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBets = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/bets" : `/api/bets?status=${filter}`;
      const res = await apiFetch<{ bets: BetItem[] }>(url);
      setBets(res.data.bets);
    } catch (e) {
      console.error("Failed to load bets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBets();
    }
  }, [user, filter]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-white mb-2">My Wagers & Bet History</h1>
        <p className="text-xs text-slate-400 mb-6">Please log in to view your active and settled bets.</p>
        <button
          onClick={() => openAuthModal("login")}
          className="rounded-xl bg-emerald-500 text-slate-950 px-6 py-2.5 text-xs font-bold hover:bg-emerald-400 transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-400" />
            <span>My Wagers & Bet History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time statuses, settled returns, and active accumulators
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          {(["ALL", "PENDING", "WON", "LOST"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === status
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {status === "PENDING" ? "Open Bets" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Bets List */}
      {bets.length === 0 && !loading ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-500">
          <History className="h-10 w-10 mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-300">No {filter !== "ALL" ? filter.toLowerCase() : ""} bets found.</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Explore upcoming match fixtures and build your bet slip.</p>
          <Link
            href="/sports"
            className="inline-block rounded-xl bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold hover:bg-emerald-400 transition"
          >
            Browse Sports Fixtures
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bets.map((bet) => {
            const isWon = bet.status === "WON";
            const isLost = bet.status === "LOST";
            const isPending = bet.status === "PENDING";

            return (
              <div
                key={bet.id}
                className={`rounded-3xl bg-slate-900 border p-5 flex flex-col gap-4 transition shadow-lg ${
                  isWon
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 to-slate-900"
                    : isLost
                    ? "border-red-500/30"
                    : "border-slate-800"
                }`}
              >
                {/* Bet Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      {bet.betType}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: #{bet.id.slice(-8)}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isWon
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isLost
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {isWon && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isLost && <XCircle className="h-3.5 w-3.5" />}
                    {isPending && <Clock className="h-3.5 w-3.5" />}
                    <span>{bet.status}</span>
                  </span>
                </div>

                {/* Selections / Legs */}
                <div className="flex flex-col gap-2">
                  {bet.selections.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800/60 p-3 text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{s.selectionName}</span>
                        <span className="text-[11px] text-slate-400">
                          {s.event ? `${s.event.homeTeam} vs ${s.event.awayTeam} • ${s.event.league ?? ""}` : "Match Event"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-emerald-400 tabular-nums">
                          @{Number(s.oddsAtPlacement).toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
                          s.status === "WON"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : s.status === "LOST"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase">Stake</span>
                    <span className="font-bold font-mono text-white tabular-nums">{Number(bet.stake).toFixed(2)} ETB</span>
                  </div>

                  <div className="flex flex-col text-center">
                    <span className="text-[10px] text-slate-400 uppercase">Combined Odds</span>
                    <span className="font-bold font-mono text-emerald-400 tabular-nums">{Number(bet.combinedOdds).toFixed(2)}</span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 uppercase">
                      {isWon ? "Payout Credited" : "Potential Return"}
                    </span>
                    <span className={`font-black font-mono tabular-nums ${isWon ? "text-emerald-400 text-sm" : "text-white"}`}>
                      {Number(bet.potentialReturn).toFixed(2)} ETB
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
