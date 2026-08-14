"use client";

import { useState } from "react";
import { X, Lock, Mail, User, Phone, Calendar, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, setUser } = useAuthStore();
  const [tab, setTab] = useState<"login" | "register">(authModalTab);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("1998-01-01");
  const [regTerms, setRegTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      // Refresh current user session
      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      closeAuthModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to sign in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone || undefined,
          password: regPassword,
          dateOfBirth: regDob,
          country: "ET",
          termsAccepted: regTerms,
        }),
      });

      // Automatically log in after registration
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      closeAuthModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Registration failed. Please check the inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for testing demo environment
  const autofillDemoUser = () => {
    setLoginEmail("user@sportsbook.demo");
    setLoginPassword("User1234!");
  };

  const autofillAdmin = () => {
    setLoginEmail("admin@sportsbook.demo");
    setLoginPassword("Admin1234!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => { setTab("login"); setErrorMessage(null); }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                tab === "login"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setErrorMessage(null); }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                tab === "register"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <button
            onClick={closeAuthModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Signing In..." : "Sign In to Account"}
              </button>

              {/* Demo presets */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  ⚡ Quick Demo Presets
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={autofillDemoUser}
                    className="rounded-lg bg-slate-800/70 border border-slate-700/60 p-2 text-left hover:bg-slate-800 transition"
                  >
                    <p className="text-[11px] font-semibold text-emerald-400">Demo User</p>
                    <p className="text-[10px] text-slate-400">5,000 ETB Balance</p>
                  </button>
                  <button
                    type="button"
                    onClick={autofillAdmin}
                    className="rounded-lg bg-slate-800/70 border border-slate-700/60 p-2 text-left hover:bg-slate-800 transition"
                  >
                    <p className="text-[11px] font-semibold text-amber-400">Admin Account</p>
                    <p className="text-[10px] text-slate-400">Full Risk & Ops</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Abebe"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Bekele"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Phone</label>
                  <input
                    type="tel"
                    placeholder="+251 9..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Password (min 10 chars)</label>
                <input
                  type="password"
                  required
                  minLength={10}
                  placeholder="••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regTerms}
                  onChange={(e) => setRegTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  I confirm I am 18+ and accept the Terms & Conditions and Responsible Gambling policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !regTerms}
                className="mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Creating Account..." : "Create Account (Get 10,000 ETB Demo)"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
