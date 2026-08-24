"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  Flame, 
  Gift, 
  ShieldCheck, 
  Search, 
  Wallet, 
  Plus, 
  Bell, 
  User, 
  LogOut, 
  History, 
  Settings,
  ChevronDown
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api-client";

export function Header() {
  const pathname = usePathname();
  const { 
    user, 
    setUser, 
    openAuthModal, 
    openDepositModal, 
    openSearchModal 
  } = useAuthStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; createdAt: string }>>([]);

  useEffect(() => {
    // Check initial auth session
    apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me")
      .then((res) => {
        if (res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearchModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearchModal]);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserDropdownOpen(false);
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navLinks = [
    { label: "Sports", href: "/sports", icon: Trophy },
    { label: "Live In-Play", href: "/live", icon: Flame, isLive: true },
    { label: "Promotions", href: "/promotions", icon: Gift },
    { label: "Responsible Play", href: "/responsible-gambling", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="ApexBet Logo"
              className="h-10 w-10 rounded-xl object-cover border border-emerald-500/30 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white">
                APEX<span className="text-emerald-400">BET</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-emerald-500/90 -mt-1 uppercase">
                World-Class Sportsbook
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/70 text-emerald-400 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${link.isLive ? "text-red-400 animate-pulse" : ""}`} />
                  <span>{link.label}</span>
                  {link.isLive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Search, Wallet, Profile / Auth */}
        <div className="flex items-center gap-3">
          
          {/* Search Trigger */}
          <button
            onClick={openSearchModal}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search match or team...</span>
            <kbd className="hidden sm:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {user ? (
            /* Logged in state */
            <div className="flex items-center gap-2.5">
              
              {/* Wallet balance pill */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 pl-3 shadow-inner">
                <div className="flex flex-col mr-2 text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Wallet Balance</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    {user.wallet ? Number(user.wallet.availableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} {user.wallet?.currency ?? "ETB"}
                  </span>
                </div>
                <button
                  onClick={openDepositModal}
                  title="Deposit Funds"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                </button>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-sm text-slate-200 hover:bg-slate-800 transition"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    {user.firstName[0]}
                  </div>
                  <span className="hidden sm:inline font-medium text-xs">{user.firstName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-semibold text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                          {user.role}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                          KYC: {user.kycStatus}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>My Account & Security</span>
                    </Link>

                    <Link
                      href="/account/bets"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <History className="h-3.5 w-3.5 text-slate-400" />
                      <span>Bet History</span>
                    </Link>

                    <Link
                      href="/account/wallet"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <Wallet className="h-3.5 w-3.5 text-slate-400" />
                      <span>Wallet & Ledger</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition mt-1"
                      >
                        <Settings className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-semibold">Admin Operations Portal</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Unauthenticated guest actions */
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
              >
                Register
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
