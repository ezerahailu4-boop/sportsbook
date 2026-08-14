"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";

interface SettleReport {
  settledSelections: number;
  settledBets: number;
  wonBets: number;
  lostBets: number;
  voidBets: number;
  totalPayoutDistributed: string;
}

const SAMPLE_EVENTS = [
  {
    id: "demo-soccer_epl-0",
    name: "Manchester City vs Liverpool",
    league: "Premier League",
    marketKey: "h2h",
    outcomes: [
      { id: "h2h:demo_book:Manchester City:", name: "Manchester City" },
      { id: "h2h:demo_book:Draw:", name: "Draw" },
      { id: "h2h:demo_book:Liverpool:", name: "Liverpool" },
    ],
  },
  {
    id: "demo-soccer_epl-1",
    name: "Arsenal vs Chelsea",
    league: "Premier League",
    marketKey: "h2h",
    outcomes: [
      { id: "h2h:demo_book:Arsenal:", name: "Arsenal" },
      { id: "h2h:demo_book:Draw:", name: "Draw" },
      { id: "h2h:demo_book:Chelsea:", name: "Chelsea" },
    ],
  },
  {
    id: "demo-basketball_nba-0",
    name: "Boston Celtics vs LA Lakers",
    league: "NBA Basketball",
    marketKey: "h2h",
    outcomes: [
      { id: "h2h:demo_book:Boston Celtics:", name: "Boston Celtics" },
      { id: "h2h:demo_book:LA Lakers:", name: "LA Lakers" },
    ],
  },
];

export default function AdminSettlementPage() {
  const [selectedEventId, setSelectedEventId] = useState(SAMPLE_EVENTS[0].id);
  const [winningOutcomeId, setWinningOutcomeId] = useState(SAMPLE_EVENTS[0].outcomes[0].id);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SettleReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedEvent = SAMPLE_EVENTS.find((e) => e.id === selectedEventId) ?? SAMPLE_EVENTS[0];

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = SAMPLE_EVENTS.find((e) => e.id === eventId);
    if (ev) setWinningOutcomeId(ev.outcomes[0].id);
    setReport(null);
    setErrorMessage(null);
  };

  const handleExecuteSettlement = async () => {
    setLoading(true);
    setErrorMessage(null);
    setReport(null);

    const outcomeResults = selectedEvent.outcomes.map((o) => ({
      outcomeId: o.id,
      status: (o.id === winningOutcomeId ? "WON" : "LOST") as "WON" | "LOST",
    }));

    try {
      const res = await apiFetch<SettleReport>("/api/admin/settle", {
        method: "POST",
        body: JSON.stringify({
          eventId: selectedEvent.id,
          marketKey: selectedEvent.marketKey,
          outcomeResults,
          reason: `Official result finalized: ${selectedEvent.outcomes.find((o) => o.id === winningOutcomeId)?.name} won.`,
        }),
      });

      setReport(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to execute settlement. Please check admin permissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Operations Center</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-emerald-400" />
            <span>Authoritative Match Settlement Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve match results and trigger atomic wallet credit distributions for winners.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-5 shadow-xl">
        
        {/* Step 1: Select Match */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Select Match Event
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_EVENTS.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleEventChange(ev.id)}
                className={`rounded-2xl p-3 text-left border transition ${
                  selectedEventId === ev.id
                    ? "bg-emerald-500/10 border-emerald-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">{ev.league}</span>
                <span className="text-xs font-bold text-white block mt-0.5">{ev.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Choose Winning Outcome */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            2. Declare Official Winning Outcome
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedEvent.outcomes.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setWinningOutcomeId(o.id)}
                className={`rounded-2xl p-3 text-center border font-bold text-xs transition ${
                  winningOutcomeId === o.id
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {o.name} (WINNER)
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Executes inside a PostgreSQL transaction with row-level locks.</span>
          </div>

          <button
            onClick={handleExecuteSettlement}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-slate-950" />}
            <span>{loading ? "Settling Bets..." : "Commit Match Settlement"}</span>
          </button>
        </div>

        {/* Settlement Report */}
        {report && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Settlement Batch Completed Successfully!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Evaluated Selections</span>
                <span className="text-sm font-bold text-white font-mono">{report.settledSelections}</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Bets Settled WON</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{report.wonBets}</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Bets Settled LOST</span>
                <span className="text-sm font-bold text-red-400 font-mono">{report.lostBets}</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Payouts Credited</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{report.totalPayoutDistributed} ETB</span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

      </div>

    </div>
  );
}
