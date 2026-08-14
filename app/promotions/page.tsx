import Link from "next/link";
import { Gift, Sparkles, Flame, CheckCircle, ShieldCheck, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { BetSlip } from "@/components/betting/BetSlip";

const PROMOTIONS = [
  {
    id: "welcome-match",
    badge: "New Players",
    title: "100% Welcome Deposit Match up to 2,000 ETB",
    description: "Double your first deposit with instant demo credits upon successful registration and verification.",
    terms: "Minimum deposit 100 ETB. Valid for new registrations. 5x wagering requirement on sports selections with minimum odds of 1.50.",
    action: "Claim Bonus",
    color: "from-emerald-500/20 to-emerald-950/40",
  },
  {
    id: "acca-boost",
    badge: "All Sports",
    title: "Accumulator Extra Winnings Boost up to 50%",
    description: "Get up to 50% extra payout on accumulator slips with 4 or more selections across Football, Basketball, and Tennis.",
    terms: "Minimum 4 selections required. Each leg must have odds of 1.30 or greater. Extra winnings are credited as cash into your wallet ledger upon settlement.",
    action: "Build Accumulator",
    color: "from-amber-500/20 to-amber-950/40",
  },
  {
    id: "cashback-derby",
    badge: "Premier League",
    title: "Bore Draw 0-0 Stake Refund",
    description: "If any Premier League derby finishes 0-0, we refund 100% of your pre-match 1X2 stake back to your wallet.",
    terms: "Applicable on Pre-Match 1X2 Single bets only. Refund is issued automatically via BET_REFUND within 10 minutes of final whistle.",
    action: "Explore Premier League",
    color: "from-blue-500/20 to-blue-950/40",
  },
];

export default function PromotionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Gift className="h-6 w-6 text-emerald-400" />
              <span>Sportsbook Promotions & Offers</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enhance your sports betting experience with boosted payouts and deposit bonuses.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {PROMOTIONS.map((promo) => (
              <div
                key={promo.id}
                className={`rounded-3xl bg-gradient-to-br ${promo.color} border border-slate-800 p-6 flex flex-col gap-4 shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    {promo.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Verified Terms</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">{promo.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{promo.description}</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">Applicable Terms & Conditions:</span>
                  {promo.terms}
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/sports"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition shadow-md"
                  >
                    <span>{promo.action}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

        <BetSlip />
      </div>
    </div>
  );
}
