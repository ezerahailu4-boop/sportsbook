"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Flame, Receipt, User } from "lucide-react";
import { useBetSlipStore } from "@/store/bet-slip";
import { useAuthStore } from "@/store/auth-store";

export function MobileNav() {
  const pathname = usePathname();
  const { selections, toggleOpen, isOpen } = useBetSlipStore();
  const { user, openAuthModal } = useAuthStore();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Sports", href: "/sports", icon: Trophy },
    { label: "Live", href: "/live", icon: Flame, isLive: true },
    { 
      label: "My Bets", 
      href: "/account/bets", 
      icon: Receipt,
      requireAuth: true,
    },
    { 
      label: "Account", 
      href: user ? "/account" : "#", 
      icon: User,
      onClick: user ? undefined : () => openAuthModal("login"),
    },
  ];

  return (
    <>
      {/* Floating Bet Slip Badge Trigger (visible on mobile screens when there are selections and drawer is not open) */}
      {selections.length > 0 && !isOpen && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden">
          <button
            onClick={toggleOpen}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-slate-950 font-bold shadow-2xl shadow-emerald-500/50 active:scale-95 transition-transform"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-emerald-400 text-xs font-black">
              {selections.length}
            </div>
            <span className="text-xs tracking-wide uppercase">Open Bet Slip</span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg lg:hidden px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && item.href !== "#" && pathname.startsWith(item.href));

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-slate-200 transition"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
                isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
