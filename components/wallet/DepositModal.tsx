"use client";

import { useState } from "react";
import { X, Wallet, CheckCircle2, AlertCircle, ArrowDownLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

const DEPOSIT_PRESETS = [200, 500, 1000, 2500, 5000];

export function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, user, setUser } = useAuthStore();
  const [amount, setAmount] = useState("1000");
  const [paymentMethod, setPaymentMethod] = useState("mock_telebirr");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isDepositModalOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await apiFetch<{ transactionId: string; status: string; redirectUrl?: string }>("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          currency: "ETB",
          paymentMethod,
          idempotencyKey,
        }),
      });

      // In Demo Mode, simulate instant verified webhook completion
      if (res.data.status === "PENDING") {
        await apiFetch(`/api/payments/webhook/${paymentMethod}`, {
          method: "POST",
          body: JSON.stringify({
            event: "payment.completed",
            transactionId: res.data.transactionId,
            reference: `dep_${idempotencyKey}`,
            amount: Number(amount),
            currency: "ETB",
            status: "COMPLETED",
          }),
        }).catch(() => {});
      }

      // Refresh current user session and wallet balance
      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Deposit processing failed. Please try again.");
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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deposit Funds</h3>
              <p className="text-[10px] text-slate-400">Demo Wallet Instant Top-Up</p>
            </div>
          </div>
          <button
            onClick={closeDepositModal}
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
              <h4 className="text-base font-bold text-white">Deposit Successful!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {Number(amount).toLocaleString()} ETB has been credited to your demo wallet ledger.
              </p>
              <button
                onClick={closeDepositModal}
                className="mt-6 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Done & Start Betting
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeposit} className="flex flex-col gap-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Payment Methods */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Select Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "mock_telebirr", name: "Telebirr (Demo)", icon: "📱" },
                    { id: "mock_cbebirr", name: "CBE Birr (Demo)", icon: "🏦" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border ${
                        paymentMethod === p.id
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input & presets */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-slate-300">Deposit Amount (ETB)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-sm font-bold text-white tabular-nums focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500">ETB</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {DEPOSIT_PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                        amount === val.toString()
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800/60 p-2.5 text-[10px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Append-only financial transaction ledger with zero float truncation.</span>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Processing Ledger Credit..." : `Confirm Deposit of ${Number(amount).toLocaleString()} ETB`}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
