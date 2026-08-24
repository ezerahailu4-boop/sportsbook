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
  Image as ImageIcon, 
  Eye, 
  X, 
  Search, 
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

interface StoredDeposit {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: "telebirr" | "cbe";
  senderName: string;
  senderAccount: string;
  screenshotUrl?: string;
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminDepositsPage() {
  const { user } = useAuthStore();
  const [deposits, setDeposits] = useState<StoredDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ deposits: StoredDeposit[] }>("/api/admin/deposits");
      setDeposits(res.data.deposits || []);
    } catch (err) {
      console.error("Failed to load deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(depositId);
    setFeedback(null);

    try {
      const res = await apiFetch<{ deposit: StoredDeposit; message: string }>("/api/admin/deposits", {
        method: "POST",
        body: JSON.stringify({ depositId, action }),
      });

      setFeedback({ type: "success", text: res.data.message });
      // Update local state
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? { ...d, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : d))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedback({ type: "error", text: err.message });
      } else {
        setFeedback({ type: "error", text: "Action failed. Please try again." });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (filter !== "ALL" && d.status !== filter) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      return (
        d.userEmail.toLowerCase().includes(query) ||
        d.senderName.toLowerCase().includes(query) ||
        d.senderAccount.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const pendingCount = deposits.filter((d) => d.status === "PENDING_VERIFICATION").length;
  const approvedTotal = deposits
    .filter((d) => d.status === "APPROVED")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>Deposit Verification Desk</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 font-bold border border-amber-500/30 animate-pulse">
                  {pendingCount} Pending Review
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">Review Telebirr & CBE deposit proofs, verify screenshots, and credit player wallets</p>
          </div>
        </div>

        <button
          onClick={fetchDeposits}
          className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-semibold transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
          <span className="text-2xl font-black text-amber-400 tabular-nums">{pendingCount}</span>
          <span className="text-[10px] text-slate-500">Requires manual check</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Verified Volume</span>
          <span className="text-2xl font-black text-emerald-400 tabular-nums">{approvedTotal.toLocaleString()} ETB</span>
          <span className="text-[10px] text-slate-500">Credited to player accounts</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receiver Accounts</span>
          <span className="text-xs font-bold text-white">Ezera Hailu</span>
          <span className="text-[10px] font-mono text-slate-400">Telebirr 0941960863 | CBE 1000400846271</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["ALL", "PENDING_VERIFICATION", "APPROVED", "REJECTED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                filter === t
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t === "ALL" ? "All Submissions" : t === "PENDING_VERIFICATION" ? "Pending Review" : t}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search email, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Submission Date</th>
                <th className="p-4">Player Account</th>
                <th className="p-4">Method & Destination</th>
                <th className="p-4">Sender Details</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Screenshot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No deposit proof submissions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(d.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{d.userEmail}</span>
                        <span className="text-[10px] font-mono text-slate-500">{d.userId}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{d.paymentMethod === "telebirr" ? "📱" : "🏦"}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-white uppercase">{d.paymentMethod}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {d.paymentMethod === "telebirr" ? "0941960863" : "1000400846271"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{d.senderName}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{d.senderAccount}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-black font-mono text-sm text-emerald-400 tabular-nums">
                        {d.amount.toLocaleString()} ETB
                      </span>
                    </td>

                    <td className="p-4">
                      {d.screenshotUrl ? (
                        <button
                          onClick={() => setSelectedScreenshot(d.screenshotUrl!)}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 p-1.5 text-[11px] text-emerald-400 transition"
                        >
                          <img
                            src={d.screenshotUrl}
                            alt="Receipt"
                            className="h-7 w-7 rounded object-cover border border-slate-700"
                          />
                          <span className="font-medium">View</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">No image</span>
                      )}
                    </td>

                    <td className="p-4">
                      {d.status === "PENDING_VERIFICATION" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          <Clock className="h-3 w-3" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {d.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {d.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          <XCircle className="h-3 w-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      {d.status === "PENDING_VERIFICATION" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(d.id, "APPROVE")}
                            disabled={actionLoading === d.id}
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 font-bold text-xs shadow-md transition disabled:opacity-50"
                          >
                            {actionLoading === d.id ? "Processing..." : "Approve & Credit"}
                          </button>
                          <button
                            onClick={() => handleAction(d.id, "REJECT")}
                            disabled={actionLoading === d.id}
                            className="rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 px-3 py-1.5 font-bold text-xs transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Full-screen Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Deposit Receipt Proof</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl">
              <img
                src={selectedScreenshot}
                alt="Payment Screenshot Proof"
                className="w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
