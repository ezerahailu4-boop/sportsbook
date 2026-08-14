"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Settings, 
  Users, 
  Receipt, 
  Radio, 
  Trophy, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Activity
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState({
    registeredUsers: 24,
    activeUsers: 18,
    totalBets: 65,
    openBets: 12,
    totalStakes: "148,200.00 ETB",
    totalPayouts: "112,450.00 ETB",
    grossGamingRevenue: "+35,750.00 ETB",
    pendingWithdrawals: 2,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Operations & Risk Command Center</h1>
            <p className="text-xs text-slate-400">Authoritative Sportsbook Operator Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            System Status: Nominal
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
            Mode: DEMO
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stakes Wagered</span>
          <span className="text-lg font-black text-white tabular-nums">{metrics.totalStakes}</span>
          <span className="text-[10px] text-emerald-400">Gross Turnover</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Gaming Revenue</span>
          <span className="text-lg font-black text-emerald-400 tabular-nums">{metrics.grossGamingRevenue}</span>
          <span className="text-[10px] text-slate-400">GGR (Stakes - Winnings)</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Wagering Bets</span>
          <span className="text-lg font-black text-amber-400 tabular-nums">{metrics.openBets} PENDING</span>
          <span className="text-[10px] text-slate-400">Total Bets: {metrics.totalBets}</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Accounts</span>
          <span className="text-lg font-black text-white tabular-nums">{metrics.registeredUsers} Users</span>
          <span className="text-[10px] text-slate-400">{metrics.activeUsers} active this week</span>
        </div>
      </div>

      {/* Management Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        <Link
          href="/admin/settlement"
          className="glass-card rounded-3xl p-5 flex flex-col gap-3 group border border-emerald-500/30 hover:border-emerald-500 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Core Engine</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
              Match Settlement Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Resolve match results (Home, Away, Draw) to execute the authoritative settlement engine and distribute winnings to user wallets.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/odds"
          className="glass-card rounded-3xl p-5 flex flex-col gap-3 group border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Radio className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Feed Monitor</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
              Live Odds & Price Fluctuation
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Monitor incoming odds movements from The Odds API v4, price slip flags, and overround margins.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="glass-card rounded-3xl p-5 flex flex-col gap-3 group border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Compliance</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
              User & Risk Management
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Search accounts, verify KYC states, suspend accounts, and perform manual ledger adjustments with audit logs.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/bets"
          className="glass-card rounded-3xl p-5 flex flex-col gap-3 group border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Exposure</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
              Live Bets & Exposure Ticker
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Real-time bet placement stream, accumulator exposure, and high-stake risk indicators.
            </p>
          </div>
        </Link>

      </div>

    </div>
  );
}
