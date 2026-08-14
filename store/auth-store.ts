import { create } from "zustand";

export interface UserWallet {
  id: string;
  availableBalance: string;
  lockedBalance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  totalWinnings: string;
  currency: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN" | "RISK" | "SUPPORT";
  status: "ACTIVE" | "SUSPENDED" | "SELF_EXCLUDED" | "RESTRICTED";
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  country: string;
  wallet: UserWallet | null;
}

interface AuthStoreState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  isDepositModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isSearchModalOpen: boolean;

  setUser: (user: UserProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  openDepositModal: () => void;
  closeDepositModal: () => void;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  updateWalletBalance: (newBalance: string) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: "login",
  isDepositModalOpen: false,
  isWithdrawModalOpen: false,
  isSearchModalOpen: false,

  setUser: (user) => set({ user, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openDepositModal: () => set({ isDepositModalOpen: true }),
  closeDepositModal: () => set({ isDepositModalOpen: false }),
  openWithdrawModal: () => set({ isWithdrawModalOpen: true }),
  closeWithdrawModal: () => set({ isWithdrawModalOpen: false }),
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  updateWalletBalance: (newBalance) =>
    set((state) => ({
      user: state.user && state.user.wallet
        ? {
            ...state.user,
            wallet: { ...state.user.wallet, availableBalance: newBalance },
          }
        : state.user,
    })),
}));
