"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone, 
  Building2, 
  Search, 
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

interface StoredWithdrawal {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: string;
  accountNumber: string;
  accountName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export default function AdminWithdrawalsPage() {
  const { user } = useAuthStore();
  const [withdrawals, setWithdrawals] = useState<StoredWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ withdrawals: StoredWithdrawal[] }>("/api/admin/withdrawals");
      setWithdrawals(res.data.withdrawals || []);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (withdrawalId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(withdrawalId);
    setFeedback(null);
    try {
      const res = await apiFetch<{ message: string }>("/api/admin/withdrawals", {
        method: "POST",
        body: JSON.stringify({ withdrawalId, action }),
      });
      setFeedback({ type: "success", text: res.data.message });
      fetchWithdrawals();
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message || "Action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = withdrawals.filter((w) => {
    if (filter !== "ALL" && w.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.accountName?.toLowerCase().includes(q) ||
        w.accountNumber.toLowerCase().includes(q) ||
        w.userEmail.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = withdrawals.filter((w) => w.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Player Withdrawal Desk</h1>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-400 animate-pulse">
                  {pendingCount} Payouts Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review payout requests, send money via Telebirr or CBE, and approve payouts.
            </p>
          </div>
        </div>

        <button
          onClick={fetchWithdrawals}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-bold transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-lg animate-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "ALL", label: `All (${withdrawals.length})` },
            { id: "PENDING", label: `Pending Payouts (${pendingCount})` },
            { id: "APPROVED", label: "Paid" },
            { id: "REJECTED", label: "Rejected / Refunded" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filter === f.id
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            <span>Loading withdrawal queue...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Clock className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No withdrawal requests found</p>
            <p className="text-[11px] mt-1">Player payout requests will appear here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Player & Account</th>
                  <th className="py-3.5 px-4">Payout Method</th>
                  <th className="py-3.5 px-4">Destination Account</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4 text-right">Operator Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((w) => {
                  const isTelebirr = w.method.toLowerCase().includes("telebirr");
                  return (
                    <tr key={w.id} className="hover:bg-slate-850/50 transition">
                      
                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{w.accountName || "Player"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{w.userEmail}</div>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {isTelebirr ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <Smartphone className="h-3.5 w-3.5" />
                              <span>Telebirr</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sky-400 font-bold">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>CBE Bank</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Destination Number */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-white font-bold">{w.accountNumber}</div>
                        <div className="text-[10px] text-slate-400">{w.accountName}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-sm font-black text-amber-400">
                          {w.amount.toLocaleString()} {w.currency}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {w.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                            <Clock className="h-3 w-3" />
                            <span>PENDING PAYOUT</span>
                          </span>
                        )}
                        {w.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PAID</span>
                          </span>
                        )}
                        {w.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                            <XCircle className="h-3 w-3" />
                            <span>REFUNDED</span>
                          </span>
                        )}
                      </td>

                      {/* Requested At */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <div>{new Date(w.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="text-[10px] text-slate-500">{new Date(w.requestedAt).toLocaleDateString()}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {w.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(w.id, "APPROVE")}
                              disabled={actionLoading === w.id}
                              className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-black transition shadow"
                              title="Confirm payout was sent"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Paid</span>
                            </button>
                            <button
                              onClick={() => handleAction(w.id, "REJECT")}
                              disabled={actionLoading === w.id}
                              className="flex items-center gap-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 px-3 py-1.5 text-xs font-bold transition"
                              title="Reject and refund money to player wallet"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Refund</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            {w.status === "APPROVED" ? "Transferred" : "Refunded to wallet"}
                          </span>
                        )}
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
