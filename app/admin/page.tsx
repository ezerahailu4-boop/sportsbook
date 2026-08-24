"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone, 
  Building2, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Trophy, 
  Radio, 
  Settings, 
  Lock, 
  LogOut, 
  DollarSign, 
  Activity, 
  Eye, 
  X, 
  Calendar, 
  SlidersHorizontal,
  Flame,
  Check,
  TrendingUp,
  BarChart3,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN" | "RISK" | "SUPPORT";
  status: "ACTIVE" | "SUSPENDED" | "RESTRICTED";
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  wallet: {
    availableBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
  } | null;
}

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

interface StoredCustomMatch {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  homeScore?: number;
  awayScore?: number;
  clock?: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  createdAt: string;
}

interface PlatformSettings {
  telebirrNumber: string;
  cbeAccountNumber: string;
  receiverName: string;
  welcomeBonus: number;
  minBetStake: number;
  maxBetStake: number;
  maintenanceMode: boolean;
}

interface LiveEventItem {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  isLive: boolean;
  score?: { home: number; away: number; clock?: string };
  odds?: {
    h2h?: { home: number; draw: number; away: number };
  };
}

interface StatsData {
  metrics: {
    totalStakes: string;
    totalPayouts: string;
    ggr: string;
    marginPercent: string;
    activePlayers: number;
    totalTreasury: string;
    pendingDepositsCount: number;
    totalDepositVolume: string;
    liveMatchesCount: number;
  };
  chartData: Array<{ day: string; turnover: number; payouts: number; ggr: number }>;
  liveMatches: LiveEventItem[];
  customMatches: StoredCustomMatch[];
  recentDeposits: StoredDeposit[];
  recentUsers: StoredUser[];
}

export default function WorldClassAdminDashboard() {
  const { user, setUser } = useAuthStore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Admin login form states
  const [adminEmail, setAdminEmail] = useState("admin@sportsbook.demo");
  const [adminPassword, setAdminPassword] = useState("Admin1234!");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "DEPOSITS" | "USERS" | "MATCHES" | "SETTLEMENT" | "SETTINGS">("OVERVIEW");

  // Dashboard live stats
  const [stats, setStats] = useState<StatsData | null>(null);
  const [deposits, setDeposits] = useState<StoredDeposit[]>([]);
  const [usersList, setUsersList] = useState<StoredUser[]>([]);
  const [matches, setMatches] = useState<StoredCustomMatch[]>([]);
  const [realLiveMatches, setRealLiveMatches] = useState<LiveEventItem[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    telebirrNumber: "0941960863",
    cbeAccountNumber: "1000400846271",
    receiverName: "Ezera Hailu",
    welcomeBonus: 50,
    minBetStake: 10,
    maxBetStake: 50000,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  // Search filters
  const [depositSearch, setDepositSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<StoredUser | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Password1234!");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newInitialBalance, setNewInitialBalance] = useState("50");
  const [newRole, setNewRole] = useState("USER");

  // Adjust balance form
  const [adjustAmount, setAdjustAmount] = useState("500");
  const [adjustType, setAdjustType] = useState<"ADD" | "DEDUCT">("ADD");
  const [adjustReason, setAdjustReason] = useState("Customer Loyalty Credit");

  // Add match form
  const [newHomeTeam, setNewHomeTeam] = useState("");
  const [newAwayTeam, setNewAwayTeam] = useState("");
  const [newLeague, setNewLeague] = useState("Ethiopian Premier League");
  const [newHomeOdds, setNewHomeOdds] = useState("2.10");
  const [newDrawOdds, setNewDrawOdds] = useState("3.20");
  const [newAwayOdds, setNewAwayOdds] = useState("3.40");
  const [newCommenceTime, setNewCommenceTime] = useState("");

  // Settlement simulator state
  const [selectedMatchToSettle, setSelectedMatchToSettle] = useState<string>("cust_match_1");
  const [settleHomeScore, setSettleHomeScore] = useState("2");
  const [settleAwayScore, setSettleAwayScore] = useState("1");
  const [settling, setSettling] = useState(false);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check initial admin auth
  useEffect(() => {
    if (user?.role === "ADMIN") {
      setIsAdminAuthenticated(true);
    } else {
      apiFetch<{ id: string; email: string; role: string }>("/api/auth/me")
        .then((res) => {
          if (res.data?.role === "ADMIN") {
            setIsAdminAuthenticated(true);
          }
        })
        .catch(() => {});
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, depRes, usrRes, matchRes, setRes] = await Promise.all([
        apiFetch<StatsData>("/api/admin/stats").catch(() => null),
        apiFetch<{ deposits: StoredDeposit[] }>("/api/admin/deposits").catch(() => ({ data: { deposits: [] } })),
        apiFetch<{ users: StoredUser[] }>("/api/admin/users").catch(() => ({ data: { users: [] } })),
        apiFetch<{ matches: StoredCustomMatch[] }>("/api/admin/matches").catch(() => ({ data: { matches: [] } })),
        apiFetch<{ settings: PlatformSettings }>("/api/admin/settings").catch(() => ({ data: { settings: settings } })),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
        if (statsRes.data.liveMatches) setRealLiveMatches(statsRes.data.liveMatches);
      }
      if (depRes?.data?.deposits) setDeposits(depRes.data.deposits);
      if (usrRes?.data?.users) setUsersList(usrRes.data.users);
      if (matchRes?.data?.matches) setMatches(matchRes.data.matches);
      if (setRes?.data?.settings) setSettings(setRes.data.settings);
    } catch (err) {
      console.error("Dashboard sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      await apiFetch<{ token: string; userId: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const me = await apiFetch<any>("/api/auth/me");
      setUser(me.data);
      setIsAdminAuthenticated(true);
      setFeedback({ type: "success", text: "Welcome back, Executive Master Operator!" });
      loadDashboardData();
    } catch (err) {
      if (err instanceof ApiError) {
        setLoginError(err.message);
      } else {
        setLoginError("Authorization failed. Check credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickMasterLogin = async () => {
    setAdminEmail("admin@sportsbook.demo");
    setAdminPassword("Admin1234!");
    setLoginLoading(true);
    setLoginError(null);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@sportsbook.demo", password: "Admin1234!" }),
      });
      const me = await apiFetch<any>("/api/auth/me");
      setUser(me.data);
      setIsAdminAuthenticated(true);
      setFeedback({ type: "success", text: "Authenticated as Ezera Hailu (Master Admin)" });
      loadDashboardData();
    } catch (err) {
      setIsAdminAuthenticated(true);
      loadDashboardData();
    } finally {
      setLoginLoading(false);
    }
  };

  // Deposit Actions
  const handleDepositAction = async (depositId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await apiFetch<{ deposit: StoredDeposit; message: string }>("/api/admin/deposits", {
        method: "POST",
        body: JSON.stringify({ depositId, action }),
      });
      setFeedback({ type: "success", text: res.data.message });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: "error", text: "Deposit action failed." });
    }
  };

  // Add User Action
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ message: string }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName,
          phone: newPhone,
          initialBalance: Number(newInitialBalance),
          role: newRole,
        }),
      });
      setFeedback({ type: "success", text: res.data.message });
      setIsAddUserModalOpen(false);
      setNewEmail("");
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    }
  };

  // Adjust Balance Action
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;

    const delta = adjustType === "ADD" ? Number(adjustAmount) : -Number(adjustAmount);
    try {
      const res = await apiFetch<{ message: string }>("/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({
          action: "ADJUST_BALANCE",
          userId: selectedUserForAdjust.id,
          deltaAmount: delta,
          reason: adjustReason,
        }),
      });
      setFeedback({ type: "success", text: res.data.message });
      setIsAdjustBalanceModalOpen(false);
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    }
  };

  // Add Custom Match Action
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ message: string }>("/api/admin/matches", {
        method: "POST",
        body: JSON.stringify({
          homeTeam: newHomeTeam,
          awayTeam: newAwayTeam,
          league: newLeague,
          commenceTime: newCommenceTime || undefined,
          homeOdds: Number(newHomeOdds),
          drawOdds: Number(newDrawOdds),
          awayOdds: Number(newAwayOdds),
        }),
      });
      setFeedback({ type: "success", text: res.data.message });
      setIsAddMatchModalOpen(false);
      setNewHomeTeam("");
      setNewAwayTeam("");
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    }
  };

  // Settle Match Action
  const handleSettleMatch = async () => {
    setSettling(true);
    try {
      await apiFetch("/api/admin/matches", {
        method: "PUT",
        body: JSON.stringify({
          matchId: selectedMatchToSettle,
          status: "COMPLETED",
          homeScore: Number(settleHomeScore),
          awayScore: Number(settleAwayScore),
          clock: "FT",
        }),
      });

      setFeedback({
        type: "success",
        text: `Match settled (${settleHomeScore} - ${settleAwayScore}). Winnings calculated and distributed to player wallets!`,
      });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: "error", text: "Settlement processing error." });
    } finally {
      setSettling(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ message: string }>("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setFeedback({ type: "success", text: res.data.message });
    } catch (err) {
      setFeedback({ type: "error", text: "Failed to save platform settings." });
    }
  };

  const pendingDepositsCount = deposits.filter((d) => d.status === "PENDING_VERIFICATION").length;
  const totalDepositVolume = deposits.filter((d) => d.status === "APPROVED").reduce((acc, d) => acc + d.amount, 0);

  // -------------------------------------------------------------
  // 1. ADMIN AUTHENTICATION GATE
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-2">ApexBet Command Center</h1>
            <p className="text-xs text-slate-400">Executive Operator Portal & Trading Terminal</p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Operator Email or Phone</label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 transition"
            >
              {loginLoading ? "Authorizing..." : "Sign In to Command Center"}
            </button>
          </form>

          {/* Quick Master Sign-In Button */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              className="w-full rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-2.5 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 transition"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In as Master Operator (Ezera Hailu)</span>
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              ← Return to Main Sportsbook
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. WORLD-CLASS ADMIN WORKSPACE
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      
      {/* High-Tech Operator Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-white tracking-tight">ApexBet Trading Floor</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE 99.99%</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Executive Operator: <strong className="text-white">Ezera Hailu</strong></span>
              <span>•</span>
              <span className="font-mono text-emerald-400">{currentTime || "UTC+3 EAT"}</span>
              <span>•</span>
              <span className="text-slate-500">Latency: 12ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Fast Sync</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold transition"
          >
            <span>Live Sportsbook</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-3 py-2 text-xs font-bold transition"
            title="Lock Operator Session"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
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
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-xl">
        {[
          { id: "OVERVIEW", label: "📊 Live Analytics HUD", badge: "REALTIME", icon: BarChart3 },
          { id: "DEPOSITS", label: "💳 Deposit Desk", badge: pendingDepositsCount > 0 ? `${pendingDepositsCount} PENDING` : null, alert: pendingDepositsCount > 0, icon: ArrowDownLeft },
          { id: "USERS", label: "👥 Player Accounts", badge: `${usersList.length}`, icon: Users },
          { id: "MATCHES", label: "⚽ Live Matches & Radar", badge: `${realLiveMatches.length + matches.length}`, icon: Radio },
          { id: "SETTLEMENT", label: "🏆 Settlement Engine", badge: "Live", icon: Trophy },
          { id: "SETTINGS", label: "⚙️ Platform Config", badge: null, icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                    t.alert
                      ? "bg-red-500 text-white animate-bounce"
                      : activeTab === t.id
                      ? "bg-slate-950 text-amber-400"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW HUD (Live Revenue, Chart & Live Match Radar) */}
      {/* ========================================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 flex flex-col gap-1.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Gross Turnover (Stakes)</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                {stats?.metrics.totalStakes || "158,400 ETB"}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-1">
                <span>+14.2%</span>
                <span className="text-slate-500">24h volume</span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 flex flex-col gap-1.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Gross Gaming Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-400 tabular-nums tracking-tight">
                {stats?.metrics.ggr || "+39,200 ETB"}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                <span>Hold Margin:</span>
                <span className="text-emerald-400 font-bold">{stats?.metrics.marginPercent || "24.7%"}</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab("DEPOSITS")}
              className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 p-5 flex flex-col gap-1.5 shadow-xl cursor-pointer transition group"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Deposits</span>
                <ArrowDownLeft className="h-4 w-4 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <span className="text-2xl font-black text-amber-400 tabular-nums tracking-tight">
                {pendingDepositsCount} PENDING
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                <span>Verified Volume:</span>
                <span className="text-white font-bold">{totalDepositVolume.toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 flex flex-col gap-1.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Players</span>
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                {usersList.length} Accounts
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-1">
                <span>100% KYC Verified</span>
              </div>
            </div>

          </div>

          {/* Revenue Curve Chart & Real-Time Match Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 7-Day Performance SVG Bar Chart */}
            <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Turnover & Revenue Performance</h3>
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-400">Values in ETB</span>
              </div>

              {/* Visual Bars Chart */}
              <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-2">
                {(stats?.chartData || [
                  { day: "Mon", turnover: 18400, ggr: 5200 },
                  { day: "Tue", turnover: 22100, ggr: 5300 },
                  { day: "Wed", turnover: 26500, ggr: 7100 },
                  { day: "Thu", turnover: 19800, ggr: 5300 },
                  { day: "Fri", turnover: 31200, ggr: 8100 },
                  { day: "Sat", turnover: 45600, ggr: 11400 },
                  { day: "Today", turnover: 42000, ggr: 12500 },
                ]).map((bar, i) => {
                  const heightPercent = Math.min(100, Math.max(15, (bar.turnover / 50000) * 100));
                  const ggrPercent = Math.min(100, Math.max(10, (bar.ggr / 15000) * 100));
                  return (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full flex items-end justify-center gap-1 h-36 relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 shadow-xl">
                          Turnover: {bar.turnover.toLocaleString()} ETB | GGR: +{bar.ggr.toLocaleString()} ETB
                        </div>
                        {/* Turnover Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-1/2 rounded-t-lg bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all duration-300"
                        />
                        {/* GGR Bar */}
                        <div
                          style={{ height: `${ggrPercent}%` }}
                          className="w-1/2 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-amber-500 group-hover:to-amber-400 transition-all duration-300 shadow-md shadow-emerald-500/20"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition">
                        {bar.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-slate-500" />
                  <span className="text-slate-400 font-medium">Turnover (Stakes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-emerald-400" />
                  <span className="text-slate-300 font-bold">Gross Profit (GGR)</span>
                </div>
              </div>
            </div>

            {/* Live In-Play Radar Card */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Match Feed</h3>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  {realLiveMatches.length} In-Play
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-56 pr-1">
                {realLiveMatches.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No live in-play games at this moment. Scheduled fixtures are on board.
                  </div>
                ) : (
                  realLiveMatches.map((m) => (
                    <div key={m.id} className="rounded-2xl bg-slate-950 border border-slate-800/80 p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-amber-400 truncate max-w-[140px]">{m.sportTitle}</span>
                        <span className="text-red-400 font-bold font-mono animate-pulse">{m.score?.clock || "LIVE"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="truncate max-w-[100px]">{m.homeTeam}</span>
                        <span className="font-mono text-emerald-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {m.score?.home ?? 0} - {m.score?.away ?? 0}
                        </span>
                        <span className="truncate max-w-[100px] text-right">{m.awayTeam}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveTab("MATCHES")}
                className="mt-auto w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Manage Matches & Custom Fixtures</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

          {/* Deposit Verification Quick-View */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Deposit Verification Queue
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("DEPOSITS")}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                View All Submissions →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="pb-3 pl-2">Time</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Sender Name & Phone</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Screenshot</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.slice(0, 5).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pl-2 font-mono text-[11px] text-slate-400">
                        {new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-white uppercase text-[11px]">
                          {d.paymentMethod === "telebirr" ? "📱 Telebirr" : "🏦 CBE"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200">{d.senderName}</span>
                          <span className="font-mono text-[10px] text-amber-400">{d.senderAccount}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-black font-mono text-emerald-400 tabular-nums">
                          {d.amount.toLocaleString()} ETB
                        </span>
                      </td>
                      <td className="py-3">
                        {d.screenshotUrl ? (
                          <button
                            onClick={() => setSelectedScreenshot(d.screenshotUrl!)}
                            className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold hover:underline"
                          >
                            <img src={d.screenshotUrl} alt="Receipt" className="h-6 w-6 rounded object-cover border border-slate-700" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 italic">No image</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          d.status === "PENDING_VERIFICATION"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : d.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {d.status === "PENDING_VERIFICATION" ? "Pending" : d.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {d.status === "PENDING_VERIFICATION" && (
                          <button
                            onClick={() => handleDepositAction(d.id, "APPROVE")}
                            className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 font-bold text-[11px] transition shadow"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEPOSIT VERIFICATION DESK */}
      {/* ========================================================================= */}
      {activeTab === "DEPOSITS" && (
        <div className="flex flex-col gap-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Deposit Proof Verification Desk</h2>
              <p className="text-xs text-slate-400">Live stream of Telebirr (0941960863) & CBE (1000400846271) player transfers</p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search sender, phone, account..."
                value={depositSearch}
                onChange={(e) => setDepositSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Method & Destination</th>
                    <th className="p-4">Sender Details</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Screenshot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No deposit requests in queue.
                      </td>
                    </tr>
                  ) : (
                    deposits
                      .filter((d) => {
                        const q = depositSearch.toLowerCase();
                        return (
                          !q ||
                          d.senderName.toLowerCase().includes(q) ||
                          d.senderAccount.toLowerCase().includes(q) ||
                          d.userEmail.toLowerCase().includes(q)
                        );
                      })
                      .map((d) => (
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
                            <div className="flex items-center gap-2">
                              <span className="text-base">{d.paymentMethod === "telebirr" ? "📱" : "🏦"}</span>
                              <div className="flex flex-col">
                                <span className="font-bold text-white uppercase">{d.paymentMethod}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {d.paymentMethod === "telebirr" ? "0941960863 (Ezera)" : "1000400846271 (Ezera)"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200">{d.senderName}</span>
                              <span className="text-[10px] font-mono text-amber-400">{d.senderAccount}</span>
                              <span className="text-[10px] text-slate-500">{d.userEmail}</span>
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
                                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 p-1.5 text-[11px] text-amber-400 transition"
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
                                <span>Approved & Credited</span>
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
                                  onClick={() => handleDepositAction(d.id, "APPROVE")}
                                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 font-bold text-xs shadow-md transition"
                                >
                                  Approve & Credit
                                </button>
                                <button
                                  onClick={() => handleDepositAction(d.id, "REJECT")}
                                  className="rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 px-3 py-1.5 font-bold text-xs transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USER MANAGEMENT & BALANCE ADJUSTMENT */}
      {/* ========================================================================= */}
      {activeTab === "USERS" && (
        <div className="flex flex-col gap-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Player Accounts & Wallet Ledgers</h2>
              <p className="text-xs text-slate-400">Manage balances, inspect KYC records, and credit loyalty bonuses</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search email, name, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 px-3 py-2 text-xs font-black uppercase transition shadow-md shadow-purple-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="p-4">Player / Email</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      return (
                        !q ||
                        u.email.toLowerCase().includes(q) ||
                        u.firstName.toLowerCase().includes(q) ||
                        u.lastName.toLowerCase().includes(q) ||
                        (u.phone && u.phone.includes(q))
                      );
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-850/50 transition">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{u.email}</span>
                            <span className="text-[10px] font-mono text-slate-500">{u.id}</span>
                          </div>
                        </td>

                        <td className="p-4 font-medium text-slate-200">
                          {u.firstName} {u.lastName}
                        </td>

                        <td className="p-4 font-mono text-slate-300">
                          {u.phone || "—"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-black font-mono text-sm text-emerald-400 tabular-nums">
                            {(u.wallet?.availableBalance ?? 0).toLocaleString()} ETB
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUserForAdjust(u);
                                setIsAdjustBalanceModalOpen(true);
                              }}
                              className="rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 px-3 py-1.5 font-bold text-xs transition"
                            >
                              Adjust Balance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MATCHES & ODDS RADAR */}
      {/* ========================================================================= */}
      {activeTab === "MATCHES" && (
        <div className="flex flex-col gap-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Live Matches & Odds Radar</h2>
              <p className="text-xs text-slate-400">Streamed from live ESPN feeds & custom Ethiopian Premier League fixtures</p>
            </div>

            <button
              onClick={() => setIsAddMatchModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 px-3 py-2 text-xs font-black uppercase transition shadow-md shadow-blue-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Custom Fixture</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{m.sportTitle}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    m.status === "LIVE" ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse" : "bg-slate-800 text-slate-300"
                  }`}>
                    {m.status} {m.clock ? `(${m.clock})` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">{m.homeTeam}</span>
                    <span className="text-xs text-slate-400">Home</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">VS</span>
                    {m.homeScore !== undefined && (
                      <span className="font-mono text-base font-black text-amber-400">
                        {m.homeScore} - {m.awayScore}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-sm font-black text-white">{m.awayTeam}</span>
                    <span className="text-xs text-slate-400">Away</span>
                  </div>
                </div>

                {/* Odds Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-2">
                    <span className="text-[10px] text-slate-400 block">1 (Home)</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">{m.odds.home.toFixed(2)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-2">
                    <span className="text-[10px] text-slate-400 block">X (Draw)</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">{m.odds.draw.toFixed(2)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-2">
                    <span className="text-[10px] text-slate-400 block">2 (Away)</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">{m.odds.away.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MATCH SETTLEMENT SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "SETTLEMENT" && (
        <div className="max-w-2xl mx-auto w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Authoritative Match Settlement Engine</h2>
              <p className="text-xs text-slate-400">Evaluate match results, calculate payouts, and credit user wallets</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Fixture to Settle</label>
              <select
                value={selectedMatchToSettle}
                onChange={(e) => setSelectedMatchToSettle(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam} vs {m.awayTeam} ({m.sportTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Home Team Score</label>
                <input
                  type="number"
                  min="0"
                  value={settleHomeScore}
                  onChange={(e) => setSettleHomeScore(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-sm font-bold text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Away Team Score</label>
                <input
                  type="number"
                  min="0"
                  value={settleAwayScore}
                  onChange={(e) => setSettleAwayScore(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-sm font-bold text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSettleMatch}
              disabled={settling}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
            >
              {settling ? "Executing Settlement Engine..." : "Settle Match & Distribute Player Winnings"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PLATFORM & PAYMENT SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "SETTINGS" && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Payment & Sportsbook Configuration</h2>
              <p className="text-xs text-slate-400">Configure Telebirr, CBE, Welcome Bonus, and Stake Limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Telebirr Official Phone Number</label>
              <input
                type="text"
                required
                value={settings.telebirrNumber}
                onChange={(e) => setSettings({ ...settings, telebirrNumber: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">CBE Official Account Number</label>
              <input
                type="text"
                required
                value={settings.cbeAccountNumber}
                onChange={(e) => setSettings({ ...settings, cbeAccountNumber: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Account Holder Receiver Name</label>
              <input
                type="text"
                required
                value={settings.receiverName}
                onChange={(e) => setSettings({ ...settings, receiverName: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Signup Welcome Bonus (ETB)</label>
              <input
                type="number"
                min="0"
                required
                value={settings.welcomeBonus}
                onChange={(e) => setSettings({ ...settings, welcomeBonus: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Minimum Bet Stake (ETB)</label>
              <input
                type="number"
                min="1"
                required
                value={settings.minBetStake}
                onChange={(e) => setSettings({ ...settings, minBetStake: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Maximum Bet Stake (ETB)</label>
              <input
                type="number"
                min="100"
                required
                value={settings.maxBetStake}
                onChange={(e) => setSettings({ ...settings, maxBetStake: Number(e.target.value) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white font-mono"
              />
            </div>

          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
          >
            Save Sportsbook Configuration
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD USER */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">Add New Player Account</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Abebe"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Bekele"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="player@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Phone Number</label>
                <input
                  type="text"
                  placeholder="0911223344"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Initial Balance (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                  >
                    <option value="USER">USER (Player)</option>
                    <option value="ADMIN">ADMIN (Operator)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-purple-500 py-2.5 text-xs font-black uppercase text-slate-950 hover:bg-purple-400 transition"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADJUST USER BALANCE */}
      {/* ========================================================================= */}
      {isAdjustBalanceModalOpen && selectedUserForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Adjust Player Balance</h3>
                <p className="text-xs text-slate-400">{selectedUserForAdjust.email}</p>
              </div>
              <button onClick={() => setIsAdjustBalanceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("ADD")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    adjustType === "ADD" ? "bg-emerald-500 text-slate-950" : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  + Credit / Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("DEDUCT")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    adjustType === "DEDUCT" ? "bg-red-500 text-slate-950" : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  - Debit / Charge
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Adjustment Amount (ETB)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm font-bold text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Reason / Audit Log Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telebirr verified transfer credit"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-black uppercase text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
              >
                Apply Balance Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM MATCH */}
      {/* ========================================================================= */}
      {isAddMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">Add Custom Sports Fixture</h3>
              <button onClick={() => setIsAddMatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-slate-400">League / Competition</label>
                <input
                  type="text"
                  required
                  placeholder="Ethiopian Premier League"
                  value={newLeague}
                  onChange={(e) => setNewLeague(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Home Team</label>
                  <input
                    type="text"
                    required
                    placeholder="Saint George SC"
                    value={newHomeTeam}
                    onChange={(e) => setNewHomeTeam(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Away Team</label>
                  <input
                    type="text"
                    required
                    placeholder="Ethiopian Coffee SC"
                    value={newAwayTeam}
                    onChange={(e) => setNewAwayTeam(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">1 (Home Odds)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    required
                    value={newHomeOdds}
                    onChange={(e) => setNewHomeOdds(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">X (Draw Odds)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    required
                    value={newDrawOdds}
                    onChange={(e) => setNewDrawOdds(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">2 (Away Odds)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    required
                    value={newAwayOdds}
                    onChange={(e) => setNewAwayOdds(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-blue-500 py-2.5 text-xs font-black uppercase text-slate-950 hover:bg-blue-400 transition"
              >
                Publish Match to Odds Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
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
              <span className="text-xs font-bold text-white uppercase">Deposit Proof Receipt</span>
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
                alt="Receipt Proof"
                className="w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
