import { create } from "zustand";

export interface BetSlipSelection {
  eventId: string;
  eventLabel: string; // "Man City vs Liverpool" for display
  marketKey: string;
  marketName: string;
  outcomeId: string;
  outcomeName: string;
  bookmakerKey: string;
  price: string; // decimal string, as displayed when selected
  point: string | null;
  commenceTime: string;
}

interface BetSlipState {
  selections: BetSlipSelection[];
  betType: "SINGLE" | "MULTIPLE";
  stake: string;
  isOpen: boolean; // Mobile bottom drawer state
  oddsChangeNotice: { outcomeId: string; oldPrice: string; newPrice: string } | null;

  addSelection: (selection: BetSlipSelection) => void;
  removeSelection: (outcomeId: string) => void;
  clearAll: () => void;
  setBetType: (type: "SINGLE" | "MULTIPLE") => void;
  setStake: (stake: string) => void;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setOddsChangeNotice: (notice: BetSlipState["oddsChangeNotice"]) => void;
  acceptOddsChange: (outcomeId: string, newPrice: string) => void;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  selections: [],
  betType: "SINGLE",
  stake: "100",
  isOpen: false,
  oddsChangeNotice: null,

  addSelection: (selection) => {
    const { selections } = get();

    // Replace any existing selection from the same mutually-exclusive market on the same event
    const withoutConflicting = selections.filter(
      (s) => !(s.eventId === selection.eventId && s.marketKey === selection.marketKey)
    );

    const updated = [...withoutConflicting, selection];
    set({
      selections: updated,
      // If 2+ selections are present and type was single, we keep user preference or default to multiple
      betType: updated.length > 1 ? "MULTIPLE" : "SINGLE",
    });
  },

  removeSelection: (outcomeId) => {
    const updated = get().selections.filter((s) => s.outcomeId !== outcomeId);
    set({
      selections: updated,
      betType: updated.length <= 1 ? "SINGLE" : get().betType,
    });
  },

  clearAll: () => set({ selections: [], stake: "100", oddsChangeNotice: null }),

  setBetType: (betType) => set({ betType }),

  setStake: (stake) => set({ stake }),

  setIsOpen: (isOpen) => set({ isOpen }),

  toggleOpen: () => set({ isOpen: !get().isOpen }),

  setOddsChangeNotice: (oddsChangeNotice) => set({ oddsChangeNotice }),

  acceptOddsChange: (outcomeId, newPrice) => {
    set({
      selections: get().selections.map((s) => (s.outcomeId === outcomeId ? { ...s, price: newPrice } : s)),
      oddsChangeNotice: null,
    });
  },
}));
