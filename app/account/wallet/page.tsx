"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Receipt, Clock, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api-client";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  reference: string;
  createdAt: string;
}

export default function WalletPage() {
  const { user, openDepositModal, openWithdrawModal, openAuthModal } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ transactions: Transaction[] }>("/api/wallet/transactions");
      setTransactions(res.data.transactions);
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Wallet & Financial Ledger</h1>
        <p className="text-xs text-slate-400 mb-6">Please log in to view your ledger entries.</p>
        <button
          onClick={() => openAuthModal("login")}
          className="rounded-xl bg-emerald-500 text-slate-950 px-6 py-2.5 text-xs font-bold hover:bg-emerald-400 transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const wallet = user.wallet;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            <span>Wallet & Financial Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable, append-only double-entry transaction history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openDepositModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={openWithdrawModal}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold transition"
          >
            <ArrowUpRight className="h-4 w-4 text-amber-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Balances Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
          <span className="text-lg font-black text-emerald-400 tabular-nums">
            {wallet ? Number(wallet.availableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} {wallet?.currency ?? "ETB"}
          </span>
          <span className="text-[10px] text-emerald-500/80">Ready for Wagering</span>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Locked in Bets</span>
          <span className="text-lg font-black text-slate-300 tabular-nums">
            {wallet ? Number(wallet.lockedBalance).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} {wallet?.currency ?? "ETB"}
          </span>
          <span className="text-[10px] text-slate-500">Active Bets / Pending Payout</span>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Deposited</span>
          <span className="text-lg font-black text-white tabular-nums">
            {wallet ? Number(wallet.totalDeposited).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} {wallet?.currency ?? "ETB"}
          </span>
          <span className="text-[10px] text-slate-500">Lifetime Credits</span>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Winnings</span>
          <span className="text-lg font-black text-emerald-400 tabular-nums">
            {wallet ? Number(wallet.totalWinnings).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} {wallet?.currency ?? "ETB"}
          </span>
          <span className="text-[10px] text-slate-500">Settled Wins</span>
        </div>

      </div>

      {/* Ledger Transactions Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h2>
          </div>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {transactions.length === 0 && !loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No transactions recorded in your ledger yet. Place a bet or deposit funds to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="pb-3 pl-2">Type</th>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  const isCredit = Number(tx.amount) > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                        {isCredit ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        )}
                        <span>{tx.type}</span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400 max-w-[150px] truncate">
                        {tx.reference}
                      </td>
                      <td className={`py-3 font-bold font-mono tabular-nums ${isCredit ? "text-emerald-400" : "text-slate-200"}`}>
                        {isCredit ? "+" : ""}{Number(tx.amount).toFixed(2)} {tx.currency}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tx.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
