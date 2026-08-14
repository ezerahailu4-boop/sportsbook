"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, Clock, HeartHandshake, ShieldAlert } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { BetSlip } from "@/components/betting/BetSlip";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

export default function ResponsibleGamblingPage() {
  const { user, openAuthModal } = useAuthStore();
  const [depositLimit, setDepositLimit] = useState("5000");
  const [lossLimit, setLossLimit] = useState("2000");
  const [sessionLimitMins, setSessionLimitMins] = useState("60");
  const [coolingOffDays, setCoolingOffDays] = useState("0");
  const [selfExclusionMonths, setSelfExclusionMonths] = useState("0");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      await apiFetch("/api/responsible-gambling/limits", {
        method: "POST",
        body: JSON.stringify({
          depositLimit: depositLimit ? Number(depositLimit) : null,
          lossLimit: lossLimit ? Number(lossLimit) : null,
          sessionLimitMins: sessionLimitMins ? Number(sessionLimitMins) : null,
          coolingOffDays: Number(coolingOffDays) || null,
          selfExclusionMonths: Number(selfExclusionMonths) || null,
        }),
      });

      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update responsible gambling limits.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span>Responsible Gaming & Player Protection</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              We provide tools to help you control your gambling spending and time spent playing.
            </p>
          </div>

          {/* RG Principles Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Set Time & Session Limits</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Receive proactive reminders and automated logout triggers when your set session duration is reached.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-2">
              <Lock className="h-5 w-5 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Deposit & Loss Caps</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Control your monthly or weekly deposit volume. Increases require a 24-hour mandatory cooling-off period.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <h3 className="text-xs font-bold text-white">Self-Exclusion</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Take a break for anywhere between 24 hours to 12 months. All betting activities are immediately gated.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Configure Your Protection Limits
            </h2>

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your responsible gaming limits have been updated and enforced server-side.</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveLimits} className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Daily Deposit Limit (ETB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="No limit"
                    value={depositLimit}
                    onChange={(e) => setDepositLimit(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Maximum amount you can deposit in 24 hours.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Daily Loss Limit (ETB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="No limit"
                    value={lossLimit}
                    onChange={(e) => setLossLimit(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Maximum net loss before betting is restricted.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Session Duration Limit
                  </label>
                  <select
                    value={sessionLimitMins}
                    onChange={(e) => setSessionLimitMins(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes (1 hour)</option>
                    <option value="120">120 minutes (2 hours)</option>
                    <option value="240">240 minutes (4 hours)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Cooling-Off Period (Break)
                  </label>
                  <select
                    value={coolingOffDays}
                    onChange={(e) => setCoolingOffDays(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="0">None (Active)</option>
                    <option value="1">24 Hours</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Self-Exclusion
                  </label>
                  <select
                    value={selfExclusionMonths}
                    onChange={(e) => setSelfExclusionMonths(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="0">None (Active)</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 text-xs font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? "Updating Server Limits..." : user ? "Save & Enforce Limits" : "Sign In to Configure Limits"}
                </button>
              </div>

            </form>
          </div>

        </div>

        <BetSlip />
      </div>
    </div>
  );
}
