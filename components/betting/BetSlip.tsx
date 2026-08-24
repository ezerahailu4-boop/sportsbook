"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Receipt
} from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";
import { multiplyOddsDecimals, toMoneyDecimal } from "@/lib/money";

const STAKE_PRESETS = [50, 100, 250, 500, 1000];

export function BetSlip() {
  const {
    selections,
    betType,
    stake,
    isOpen,
    oddsChangeNotice,
    removeSelection,
    clearAll,
    setBetType,
    setStake,
    setIsOpen,
    setOddsChangeNotice,
    acceptOddsChange,
  } = useBetSlipStore();

  const { user, openAuthModal, openDepositModal, updateWalletBalance } = useAuthStore();

  const [placing, setPlacing] = useState(false);
  const [placedBetId, setPlacedBetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe combined decimal odds calculation
  const prices = selections.map((s) => s.price);
  const combinedDecimal = prices.length > 0 ? multiplyOddsDecimals(prices) : "1.00";
  const combinedDisplay = Number(combinedDecimal).toFixed(2);

  const numericStake = Number(stake) || 0;
  const potentialReturn = (numericStake * Number(combinedDecimal)).toFixed(2);
  const potentialProfit = Math.max(0, Number(potentialReturn) - numericStake).toFixed(2);

  const handlePlaceBet = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!stake || numericStake <= 0) {
      setErrorMessage("Please enter a valid stake amount.");
      return;
    }

    if (user.wallet && numericStake > Number(user.wallet.availableBalance)) {
      setErrorMessage("Insufficient balance. Please deposit funds.");
      return;
    }

    setPlacing(true);
    setErrorMessage(null);
    setPlacedBetId(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const { data } = await apiFetch<{ betId: string }>("/api/bets", {
        method: "POST",
        body: JSON.stringify({
          betType,
          stake: numericStake,
          idempotencyKey,
          selections: selections.map((s) => ({
            eventId: s.eventId,
            marketKey: s.marketKey,
            outcomeId: s.outcomeId,
            bookmakerKey: s.bookmakerKey,
            submittedPrice: s.price,
            point: s.point ?? undefined,
          })),
        }),
      });

      setPlacedBetId(data.betId);

      // Refresh wallet balance from server
      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      if (me.data?.wallet) {
        updateWalletBalance(me.data.wallet.availableBalance);
      }

      clearAll();
    } catch (err) {
      if (err instanceof ApiError && err.code === "ODDS_CHANGED") {
        const updated = (err.meta?.updatedOdds as Array<{ outcomeId: string; oldPrice: string; newPrice: string }>) ?? [];
        if (updated[0]) setOddsChangeNotice(updated[0]);
      } else if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong placing your wager.");
      }
    } finally {
      setPlacing(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      
      {/* Bet Slip Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black">
            {selections.length}
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Bet Slip</h3>
        </div>

        <div className="flex items-center gap-2">
          {selections.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs: Single vs Multiple (Accumulator) */}
      <div className="p-3 bg-slate-950/30 border-b border-slate-800/80">
        <div className="grid grid-cols-2 gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
          {(["SINGLE", "MULTIPLE"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setBetType(type)}
              className={`text-xs py-1.5 rounded-lg font-bold transition ${
                betType === type
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type === "SINGLE" ? "Single Bet" : `Acca (${selections.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications / Alerts */}
      <div className="p-3 flex flex-col gap-2">
        {placedBetId && (
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Bet Placed Successfully!</span>
              <span className="text-[10px] text-emerald-400/80">Reference ID: #{placedBetId.slice(-8)}</span>
              <Link href="/account/bets" className="text-[11px] font-bold underline mt-0.5">
                View in Bet History →
              </Link>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 flex-1">
              <span>{errorMessage}</span>
              {errorMessage.includes("Insufficient") && (
                <button
                  onClick={openDepositModal}
                  className="mt-1 rounded-lg bg-red-500/20 text-red-200 px-2 py-1 text-[10px] font-bold text-left hover:bg-red-500/30"
                >
                  + Deposit Funds
                </button>
              )}
            </div>
          </div>
        )}

        {oddsChangeNotice && (
          <div className="flex flex-col gap-2 rounded-xl bg-amber-500/15 border border-amber-500/40 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Odds have changed!</span>
            </div>
            <span className="text-[11px] text-amber-300/90 font-mono">
              Old: {oddsChangeNotice.oldPrice} → New: {oddsChangeNotice.newPrice}
            </span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => acceptOddsChange(oddsChangeNotice.outcomeId, oddsChangeNotice.newPrice)}
                className="flex-1 rounded-lg bg-amber-500 text-slate-950 py-1 font-bold text-[11px] hover:bg-amber-400 transition"
              >
                Accept New Odds
              </button>
              <button
                onClick={() => setOddsChangeNotice(null)}
                className="rounded-lg bg-slate-800 px-3 text-slate-400 text-[11px] hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selections List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-2 max-h-[340px]">
        {selections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <Receipt className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-xs font-semibold text-slate-400">Your bet slip is empty</p>
            <p className="text-[11px] text-slate-600 max-w-[200px] mt-1">
              Click any odds in match cards to build your wager.
            </p>
          </div>
        ) : (
          selections.map((s) => (
            <div
              key={s.outcomeId}
              className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 flex flex-col gap-1.5 relative group hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-snug">{s.outcomeName}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{s.marketName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md tabular-nums">
                    {s.price}
                  </span>
                  <button
                    onClick={() => removeSelection(s.outcomeId)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 truncate">{s.eventLabel}</span>
            </div>
          ))
        )}
      </div>

      {/* Stake & Returns Footer */}
      {selections.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col gap-3">
          
          {/* Accumulator Combined Odds summary */}
          {betType === "MULTIPLE" && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Combined Odds:</span>
              <span className="font-black font-mono text-emerald-400 tabular-nums">{combinedDisplay}</span>
            </div>
          )}

          {/* Stake Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400">Stake (ETB)</label>
              {user?.wallet && (
                <span className="text-[10px] text-slate-500">
                  Balance: {Number(user.wallet.availableBalance).toLocaleString()} ETB
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                placeholder="100"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 py-2.5 px-3 text-sm font-bold text-white tabular-nums focus:border-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500">ETB</span>
            </div>

            {/* Quick Stake Buttons */}
            <div className="flex items-center gap-1 mt-0.5">
              {STAKE_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStake(amt.toString())}
                  className={`flex-1 rounded-lg py-1 text-[10px] font-semibold border transition ${
                    stake === amt.toString()
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Return & Profit */}
          <div className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Potential Return:</span>
              <span className="font-bold font-mono text-white tabular-nums">{potentialReturn} ETB</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Net Profit:</span>
              <span className="font-bold font-mono text-emerald-400 tabular-nums">+{potentialProfit} ETB</span>
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={placing || !stake || numericStake <= 0}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-black tracking-wider text-slate-950 uppercase shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition"
          >
            {placing ? "Validating Odds & Ledger..." : user ? `Place Bet (${numericStake || 0} ETB)` : "Sign In to Place Bet"}
          </button>

        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
          {content}
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 backdrop-blur-md lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-h-[88vh] rounded-t-3xl bg-slate-900 border-t border-slate-700/80 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col">
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mt-2.5 mb-1 shrink-0" />
            {content}
          </div>
        </div>
      )}
    </>
  );
}
