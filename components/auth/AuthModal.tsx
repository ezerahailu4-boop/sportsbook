"use client";

import { useState, useEffect } from "react";
import { X, Lock, Mail, User, Phone, Calendar, Globe, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

interface AllowedCountry {
  code: string;
  name: string;
}

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, setUser } = useAuthStore();
  const [tab, setTab] = useState<"login" | "register" | "forgot-password" | "reset-password">(authModalTab);

  // Synchronize local tab when store tab changes
  useEffect(() => {
    setTab(authModalTab);
  }, [authModalTab]);

  // Countries
  const [countries, setCountries] = useState<AllowedCountry[]>([{ code: "ET", name: "Ethiopia" }]);

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await apiFetch<{ countries: AllowedCountry[] }>("/api/auth/allowed-countries");
        if (res.data.countries?.length > 0) {
          setCountries(res.data.countries);
        }
      } catch {
        // Fallback already set to Ethiopia
      }
    }
    loadCountries();
  }, []);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCountry, setRegCountry] = useState("ET");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("1998-01-01");
  const [regTerms, setRegTerms] = useState(true);

  // Forgot password & reset password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      // Refresh current user session
      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; emailVerified: boolean; wallet: any }>("/api/auth/me");
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
    setSuccessMessage(null);

    if (regPassword.length < 10) {
      setErrorMessage("Password must be at least 10 characters.");
      setLoading(false);
      return;
    }

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
          country: regCountry,
          termsAccepted: regTerms,
        }),
      });

      // Automatically log in after registration
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; emailVerified: boolean; wallet: any }>("/api/auth/me");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });
      setSuccessMessage(res.data.message || "Password reset link dispatched. Check server console or email.");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (resetNewPassword.length < 10) {
      setErrorMessage("New password must be at least 10 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: resetToken, password: resetNewPassword }),
      });
      setSuccessMessage(res.data.message || "Password updated successfully. You can now sign in.");
      setTimeout(() => {
        setTab("login");
        setSuccessMessage("Password reset complete. Please log in.");
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to reset password. Please verify your token.");
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
              onClick={() => { setTab("login"); setErrorMessage(null); setSuccessMessage(null); }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                tab === "login"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setErrorMessage(null); setSuccessMessage(null); }}
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

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address or Phone Number</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="user@example.com or 0911223344"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab("forgot-password"); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
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
            </form>
          )}

          {tab === "register" && (
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
                  <label className="text-[11px] font-semibold text-slate-300">Country / Region</label>
                  <select
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Date of Birth (18+)</label>
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
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
                {loading ? "Creating Account..." : "Create Account (Get 50 ETB Welcome Bonus)"}
              </button>
            </form>
          )}

          {tab === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => { setTab("login"); setErrorMessage(null); setSuccessMessage(null); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white">Reset Your Password</h3>
                <p className="text-[11px] text-slate-400">
                  Enter your account email and we'll dispatch a secure password reset link.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Sending..." : "Dispatch Password Reset Link"}
              </button>

              <div className="mt-2 pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => { setTab("reset-password"); setErrorMessage(null); setSuccessMessage(null); }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Have a reset token? Click here to enter new password
                </button>
              </div>
            </form>
          )}

          {tab === "reset-password" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => { setTab("login"); setErrorMessage(null); setSuccessMessage(null); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white">Enter New Password</h3>
                <p className="text-[11px] text-slate-400">
                  Paste the token received from the reset link and set your new password.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Reset Token</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Paste 64-character token..."
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password (min 10 chars)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    placeholder="••••••••••"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Updating Password..." : "Set New Password"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
