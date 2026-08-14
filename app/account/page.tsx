"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, ShieldCheck, Wallet, History, Lock, Mail, Phone, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api-client";

export default function AccountPage() {
  const { user, openAuthModal, setUser } = useAuthStore();
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Account Portal</h1>
        <p className="text-xs text-slate-400 mb-6">Please log in to manage your profile and wallet ledger.</p>
        <button
          onClick={() => openAuthModal("login")}
          className="rounded-xl bg-emerald-500 text-slate-950 px-6 py-2.5 text-xs font-bold hover:bg-emerald-400 transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSimulateKyc = async () => {
    setSubmittingKyc(true);
    try {
      await apiFetch("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify({
          documentType: "PASSPORT",
          documentNumber: "EP1234567",
        }),
      });

      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      setKycSuccess(true);
    } catch (e) {
      console.error("KYC simulation failed:", e);
    } finally {
      setSubmittingKyc(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xl font-black">
            {user.firstName[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                ROLE: {user.role}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                STATUS: {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href="/account/wallet"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition"
          >
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span>Wallet Ledger</span>
          </Link>
          <Link
            href="/account/bets"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition"
          >
            <History className="h-4 w-4 text-amber-400" />
            <span>My Bets</span>
          </Link>
        </div>
      </div>

      {/* KYC / Verification Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Identity & KYC Verification</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            user.kycStatus === "VERIFIED"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}>
            KYC: {user.kycStatus}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In production environments, real-money wagering and withdrawal requests require formal government ID and proof of address verification. In Demo Mode, you can test the verification state machine with the button below.
        </p>

        {kycSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Identity verified successfully! Real-money withdrawal capabilities unlocked.</span>
          </div>
        )}

        {user.kycStatus !== "VERIFIED" && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSimulateKyc}
              disabled={submittingKyc}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
            >
              {submittingKyc ? "Verifying..." : "Simulate Instant KYC Verification"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Details Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">First Name</span>
            <span className="text-xs font-bold text-white">{user.firstName}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Last Name</span>
            <span className="text-xs font-bold text-white">{user.lastName}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Email Address</span>
            <span className="text-xs font-bold text-white">{user.email}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Phone</span>
            <span className="text-xs font-bold text-white">{user.phone ?? "Not provided"}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
