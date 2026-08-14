"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Search, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  kycStatus: string;
  availableBalance: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: "usr_1",
      email: "user@sportsbook.demo",
      firstName: "Abebe",
      lastName: "Bekele",
      role: "USER",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      availableBalance: "5,000.00 ETB",
    },
    {
      id: "usr_2",
      email: "admin@sportsbook.demo",
      firstName: "Admin",
      lastName: "Operator",
      role: "ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      availableBalance: "10,000.00 ETB",
    },
  ]);

  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Operations Center</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            <span>User & Risk Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit player KYC compliance, manage suspensions, and inspect balance ledgers.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-xl bg-slate-900 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="pb-3 pl-2">Player / Account</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">KYC Status</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3">Available Balance</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 pl-2 font-bold text-white">
                    <p>{u.firstName} {u.lastName}</p>
                    <span className="text-[11px] text-slate-400 font-normal">{u.email}</span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold font-mono text-emerald-400 tabular-nums">
                    {u.availableBalance}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => alert(`Inspection of user ${u.email} opened in audit log.`)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition"
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
