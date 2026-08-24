"use client";

import Link from "next/link";
import { Receipt, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

const SAMPLE_BETS_STREAM = [
  {
    id: "bet_9821",
    user: "Abebe Bekele",
    betType: "MULTIPLE",
    selections: 3,
    stake: "500.00 ETB",
    combinedOdds: "4.85",
    potentialReturn: "2,425.00 ETB",
    status: "PENDING",
    placedAt: "2 mins ago",
  },
  {
    id: "bet_9820",
    user: "Abebe Bekele",
    betType: "SINGLE",
    selections: 1,
    stake: "200.00 ETB",
    combinedOdds: "1.85",
    potentialReturn: "370.00 ETB",
    status: "WON",
    placedAt: "45 mins ago",
  },
  {
    id: "bet_9819",
    user: "Yohannes Girma",
    betType: "SINGLE",
    selections: 1,
    stake: "1,000.00 ETB",
    combinedOdds: "2.10",
    potentialReturn: "2,100.00 ETB",
    status: "LOST",
    placedAt: "2 hours ago",
  },
];

export default function AdminBetsMonitorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
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
            <Receipt className="h-6 w-6 text-amber-400" />
            <span>Real-Time Bet Ticker & Exposure</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming incoming wagers, accumulator liabilities, and settlement statuses.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="pb-3 pl-2">Bet ID / Bettor</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Stake</th>
                <th className="pb-3">Combined Odds</th>
                <th className="pb-3">Liability (Return)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SAMPLE_BETS_STREAM.map((bet) => (
                <tr key={bet.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 pl-2 font-bold text-white">
                    <p className="font-mono text-emerald-400">#{bet.id}</p>
                    <span className="text-[11px] text-slate-400 font-normal">{bet.user}</span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {bet.betType} ({bet.selections})
                    </span>
                  </td>
                  <td className="py-3 font-bold font-mono text-white tabular-nums">
                    {bet.stake}
                  </td>
                  <td className="py-3 font-bold font-mono text-emerald-400 tabular-nums">
                    {bet.combinedOdds}
                  </td>
                  <td className="py-3 font-bold font-mono text-amber-300 tabular-nums">
                    {bet.potentialReturn}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      bet.status === "WON"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : bet.status === "LOST"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-300"
                    }`}>
                      {bet.status}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">
                    {bet.placedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
