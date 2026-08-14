"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { OddsButton } from "@/components/betting/OddsButton";
import type { NormalizedMarket } from "@/services/odds/odds-normalizer";

interface MarketCardProps {
  market: NormalizedMarket;
  eventId: string;
  eventLabel: string;
  commenceTime: string;
}

export function MarketCard({ market, eventId, eventLabel, commenceTime }: MarketCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden shadow-sm">
      
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-800/30 transition text-left"
      >
        <span className="text-xs font-bold text-slate-200">{market.name}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Market Outcomes */}
      {isOpen && (
        <div className="p-3.5 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {market.outcomes.map((outcome) => (
              <OddsButton
                key={outcome.externalId}
                eventId={eventId}
                eventLabel={eventLabel}
                marketKey={market.key}
                marketName={market.name}
                outcomeId={outcome.externalId}
                outcomeName={outcome.name}
                bookmakerKey={market.bookmakerKey}
                price={outcome.price}
                point={outcome.point}
                commenceTime={commenceTime}
                layout="horizontal"
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
