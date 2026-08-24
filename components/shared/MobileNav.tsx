"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Receipt, User, Wallet, Sparkles, Trophy } from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";
import { useAuthStore } from "@/store/auth-store";

export function MobileNav() {
  const pathname = usePathname();
  const { selections, toggleOpen, isOpen } = useBetSlipStore();
  const { user, openAuthModal, openDepositModal } = useAuthStore();

  return (
    <>
      {/* Floating Bet Slip Quick Toast (mobile) */}
      {selections.length > 0 && !isOpen && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden animate-in slide-in-from-bottom-5">
          <button
            onClick={toggleOpen}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-slate-950 font-black shadow-2xl shadow-emerald-500/50 active:scale-95 transition-transform border border-emerald-300/30"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-emerald-400 text-xs font-black shadow">
              {selections.length}
            </div>
            <span className="text-xs tracking-wider uppercase">Bet Slip</span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Glassmorphic Mobile Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl lg:hidden px-2 shadow-2xl safe-area-bottom">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition flex-1 ${
            pathname === "/" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Home className={`h-5 w-5 ${pathname === "/" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
        </Link>

        {/* 2. Live In-Play */}
        <Link
          href="/live"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition flex-1 relative ${
            pathname === "/live" ? "text-red-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Flame className={`h-5 w-5 ${pathname === "/live" ? "text-red-400 animate-pulse" : ""}`} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Live In-Play</span>
        </Link>

        {/* 3. Center Bet Slip Action Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={toggleOpen}
            className="flex flex-col items-center justify-center h-13 w-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/40 active:scale-95 transition-transform border-2 border-slate-950 p-2.5 relative"
            title="Open Bet Slip"
          >
            <Receipt className="h-5 w-5 stroke-[2.5]" />
            {selections.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-emerald-400 text-[10px] font-black border border-emerald-400 shadow">
                {selections.length}
              </span>
            )}
          </button>
        </div>

        {/* 4. Deposit Funds */}
        <button
          onClick={user ? openDepositModal : () => openAuthModal("login")}
          className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-emerald-400 transition flex-1"
        >
          <Wallet className="h-5 w-5 text-emerald-400" />
          <span className="text-[10px] font-semibold tracking-tight text-emerald-400">Deposit</span>
        </button>

        {/* 5. Account / Sign In */}
        {user ? (
          <Link
            href="/account"
            className={`flex flex-col items-center justify-center gap-1 py-1 transition flex-1 ${
              pathname.startsWith("/account") ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-black text-emerald-400">
              {user.firstName[0]}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">{user.firstName}</span>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-slate-200 transition flex-1"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-tight">Sign In</span>
          </button>
        )}

      </nav>
    </>
  );
}
