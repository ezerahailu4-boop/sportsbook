"use client";

import { useState } from "react";
import { X, ArrowUpRight, AlertCircle, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

export function WithdrawModal() {
  const { isWithdrawModalOpen, closeWithdrawModal, user, setUser } = useAuthStore();
  const [amount, setAmount] = useState("500");
  const [method, setMethod] = useState("mock_telebirr");
  const [accountNumber, setAccountNumber] = useState(user?.phone ?? "+251911223344");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isWithdrawModalOpen) return null;

  const availableBalance = user?.wallet ? Number(user.wallet.availableBalance) : 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    if (Number(amount) > availableBalance) {
      setErrorMessage("Withdrawal amount cannot exceed your available balance.");
      setLoading(false);
      return;
    }

    try {
      const idempotencyKey = crypto.randomUUID();
      await apiFetch("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          currency: "ETB",
          method,
          accountNumber,
          idempotencyKey,
        }),
      });

      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Withdrawal request failed. Please check your available balance.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Withdraw Funds</h3>
              <p className="text-[10px] text-slate-400">Demo Wallet Payout Simulator</p>
            </div>
          </div>
          <button
            onClick={closeWithdrawModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-white">Withdrawal Processed!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {Number(amount).toLocaleString()} ETB was deducted and recorded in your wallet ledger.
              </p>
              <button
                onClick={closeWithdrawModal}
                className="mt-6 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Available balance card */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 border border-slate-800 p-3">
                <span className="text-xs text-slate-400 font-medium">Available to Withdraw</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                </span>
              </div>

              {/* Payout method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Destination Account</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "mock_telebirr", name: "Telebirr (Demo)", icon: "📱" },
                    { id: "mock_cbebirr", name: "CBE Birr (Demo)", icon: "🏦" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setMethod(p.id)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border ${
                        method === p.id
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone / Account Number */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Account / Mobile Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-slate-300">Withdrawal Amount (ETB)</label>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toString())}
                    className="text-[10px] text-amber-400 hover:underline font-semibold"
                  >
                    Withdraw All
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max={availableBalance}
                    step="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-sm font-bold text-white tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500">ETB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > availableBalance}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Verifying Ledger Balance..." : `Withdraw ${Number(amount).toLocaleString()} ETB`}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
