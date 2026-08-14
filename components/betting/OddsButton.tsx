"use client";

import { useBetSlipStore, type BetSlipSelection } from "@/store/bet-slip";

interface OddsButtonProps {
  eventId: string;
  eventLabel: string;
  marketKey: string;
  marketName: string;
  outcomeId: string;
  outcomeName: string;
  bookmakerKey: string;
  price: string;
  point: string | null;
  commenceTime: string;
  layout?: "vertical" | "horizontal";
}

export function OddsButton({
  eventId,
  eventLabel,
  marketKey,
  marketName,
  outcomeId,
  outcomeName,
  bookmakerKey,
  price,
  point,
  commenceTime,
  layout = "vertical",
}: OddsButtonProps) {
  const { selections, addSelection, removeSelection } = useBetSlipStore();
  const isSelected = selections.some((s) => s.outcomeId === outcomeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelected) {
      removeSelection(outcomeId);
      return;
    }

    const selection: BetSlipSelection = {
      eventId,
      eventLabel,
      marketKey,
      marketName,
      outcomeId,
      outcomeName,
      bookmakerKey,
      price,
      point,
      commenceTime,
    };
    addSelection(selection);
  };

  if (layout === "horizontal") {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs transition border active:scale-[0.98] ${
          isSelected
            ? "odds-selected border-emerald-400"
            : "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800"
        }`}
      >
        <span className="font-medium truncate mr-2">{outcomeName}</span>
        <span className="font-bold font-mono tabular-nums">{price}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-2 min-w-[70px] flex-1 transition border active:scale-[0.97] group ${
        isSelected
          ? "odds-selected border-emerald-400"
          : "bg-slate-900/90 border-slate-800/90 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-850"
      }`}
    >
      <span className={`text-[10px] truncate max-w-full leading-tight font-medium ${isSelected ? "text-slate-950 font-bold" : "text-slate-400 group-hover:text-slate-200"}`}>
        {outcomeName}
      </span>
      <span className={`text-xs font-bold font-mono tabular-nums mt-0.5 ${isSelected ? "text-slate-950" : "text-emerald-400"}`}>
        {price}
      </span>
    </button>
  );
}
