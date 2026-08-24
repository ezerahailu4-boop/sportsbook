import fs from "fs";
import path from "path";
import { hashPassword } from "./auth-crypto";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  country: string;
  role: "USER" | "ADMIN" | "RISK" | "SUPPORT";
  status: "ACTIVE" | "SUSPENDED" | "RESTRICTED";
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
  emailVerifiedAt?: string;
  createdAt: string;
}

export interface StoredWallet {
  id: string;
  userId: string;
  mode: "DEMO" | "REAL";
  currency: string;
  availableBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface StoredSession {
  token: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
}

export interface StoredDeposit {
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

export interface StoredCustomMatch {
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

export interface StoredPlacedBet {
  id: string;
  userId: string;
  userEmail: string;
  betType: "SINGLE" | "MULTIPLE";
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
  status: "PENDING" | "WON" | "LOST" | "VOID";
  placedAt: string;
  settledAt?: string;
  selections: Array<{
    eventId: string;
    eventName: string;
    selectionName: string;
    odds: number;
  }>;
}

export interface StoredWithdrawal {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: string;
  accountNumber: string;
  accountName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface PlatformSettings {
  telebirrNumber: string;
  cbeAccountNumber: string;
  receiverName: string;
  welcomeBonus: number;
  minBetStake: number;
  maxBetStake: number;
  maintenanceMode: boolean;
}

interface LocalDatabase {
  users: StoredUser[];
  wallets: StoredWallet[];
  sessions: StoredSession[];
  deposits: StoredDeposit[];
  withdrawals: StoredWithdrawal[];
  customMatches: StoredCustomMatch[];
  bets: StoredPlacedBet[];
  settings: PlatformSettings;
  verificationTokens: Array<{ token: string; userId: string; expiresAt: string }>;
  resetTokens: Array<{ token: string; userId: string; used: boolean; expiresAt: string }>;
}

const DB_FILE = path.join(process.cwd(), ".local-sportsbook-db.json");

let memoryDb: LocalDatabase | null = null;

function loadDb(): LocalDatabase {
  if (memoryDb) return memoryDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
      if (memoryDb) return memoryDb;
    }
  } catch (e) {
    console.warn("Failed to read local db file, initializing in-memory:", (e as Error).message);
  }

  // Initial seed users
  const defaultUserHash = "$argon2id$v=19$m=65536,t=3,p=4$sENrw9UbhI+Lq1EWOltzwg$oFBz3LzwtjN9VDX/OCMpMR3ChuqGHli0ac0S/T4+oEg"; // User1234!
  const defaultAdminHash = "$argon2id$v=19$m=65536,t=3,p=4$mj6++dAeCqmUUQGXcuLu1w$qt/GkM78NIviHKCn9ZWSDOSJHNEI54Slm1tqbCmfsp4"; // Admin1234!

  memoryDb = {
    users: [
      {
        id: "usr_seed_player",
        email: "user@sportsbook.demo",
        passwordHash: defaultUserHash,
        firstName: "Abebe",
        lastName: "Bekele",
        phone: "+251922111222",
        dateOfBirth: "1996-08-20T00:00:00.000Z",
        country: "ET",
        role: "USER",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        emailVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr_seed_admin",
        email: "admin@sportsbook.demo",
        passwordHash: defaultAdminHash,
        firstName: "Admin",
        lastName: "Operator",
        phone: "+251911000000",
        dateOfBirth: "1985-05-15T00:00:00.000Z",
        country: "ET",
        role: "ADMIN",
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        emailVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    wallets: [
      {
        id: "wlt_seed_player",
        userId: "usr_seed_player",
        mode: "REAL",
        currency: "ETB",
        availableBalance: 50.0,
        totalDeposited: 50.0,
        totalWithdrawn: 0,
      },
      {
        id: "wlt_seed_admin",
        userId: "usr_seed_admin",
        mode: "REAL",
        currency: "ETB",
        availableBalance: 100000.0,
        totalDeposited: 100000.0,
        totalWithdrawn: 0,
      },
    ],
    deposits: [
      {
        id: "dep_demo_sample_1",
        userId: "usr_seed_player",
        userEmail: "user@sportsbook.demo",
        amount: 500,
        currency: "ETB",
        paymentMethod: "telebirr",
        senderName: "Abebe Bekele",
        senderAccount: "0922111222",
        status: "PENDING_VERIFICATION",
        createdAt: new Date().toISOString(),
      },
    ],
    withdrawals: [],
    customMatches: [
      {
        id: "cust_match_1",
        sportKey: "soccer_ethiopian_premier_league",
        sportTitle: "Ethiopian Premier League",
        homeTeam: "Saint George SC",
        awayTeam: "Ethiopian Coffee SC",
        commenceTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: "UPCOMING",
        odds: {
          home: 2.10,
          draw: 3.20,
          away: 3.40,
        },
        createdAt: new Date().toISOString(),
      },
    ],
    bets: [
      {
        id: "bet_tx_101",
        userId: "usr_seed_player",
        userEmail: "user@sportsbook.demo",
        betType: "SINGLE",
        stake: 250,
        combinedOdds: 2.10,
        potentialReturn: 525,
        status: "PENDING",
        placedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        selections: [
          {
            eventId: "cust_match_1",
            eventName: "Saint George SC vs Ethiopian Coffee SC",
            selectionName: "Saint George SC (Home Win)",
            odds: 2.10,
          },
        ],
      },
      {
        id: "bet_tx_102",
        userId: "usr_seed_player",
        userEmail: "user@sportsbook.demo",
        betType: "MULTIPLE",
        stake: 150,
        combinedOdds: 4.80,
        potentialReturn: 720,
        status: "WON",
        placedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        settledAt: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
        selections: [
          {
            eventId: "pl_ars_che",
            eventName: "Arsenal vs Chelsea",
            selectionName: "Arsenal",
            odds: 1.95,
          },
          {
            eventId: "ll_rma_bar",
            eventName: "Real Madrid vs Barcelona",
            selectionName: "Real Madrid",
            odds: 2.45,
          },
        ],
      },
    ],
    settings: {
      telebirrNumber: "0941960863",
      cbeAccountNumber: "1000400846271",
      receiverName: "Ezera Hailu",
      welcomeBonus: 50,
      minBetStake: 10,
      maxBetStake: 50000,
      maintenanceMode: false,
    },
    sessions: [],
    verificationTokens: [],
    resetTokens: [],
  };

  saveDb();
  return memoryDb!;
}

function saveDb() {
  if (!memoryDb) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf-8");
  } catch (e) {
    // ignore
  }
}

export const localDb = {
  getUserByEmail(email: string): StoredUser | null {
    const db = loadDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  getUserByEmailOrPhone(identifier: string): StoredUser | null {
    const db = loadDb();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, "");
    const normalizedInput = cleanDigits.startsWith("0") ? cleanDigits.slice(1) : cleanDigits;

    return (
      db.users.find((u) => {
        if (u.email.toLowerCase() === cleanId) return true;
        if (u.phone) {
          const userPhoneDigits = u.phone.replace(/\D/g, "");
          const normalizedUser = userPhoneDigits.startsWith("0") ? userPhoneDigits.slice(1) : userPhoneDigits;
          
          if (userPhoneDigits && cleanDigits) {
            if (userPhoneDigits === cleanDigits) return true;
            if (normalizedUser === normalizedInput) return true;
            if (normalizedInput.length >= 8 && userPhoneDigits.endsWith(normalizedInput)) return true;
            if (normalizedUser.length >= 8 && cleanDigits.endsWith(normalizedUser)) return true;
          }
        }
        return false;
      }) ?? null
    );
  },

  getUserById(id: string): StoredUser | null {
    const db = loadDb();
    return db.users.find((u) => u.id === id) ?? null;
  },

  createUser(user: StoredUser, initialBonus: number = 50): StoredUser {
    const db = loadDb();
    db.users.push(user);
    db.wallets.push({
      id: `wlt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      mode: "DEMO",
      currency: "ETB",
      availableBalance: initialBonus,
      totalDeposited: initialBonus,
      totalWithdrawn: 0,
    });
    saveDb();
    return user;
  },

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates };
    saveDb();
    return db.users[index];
  },

  getWallet(userId: string): StoredWallet | null {
    const db = loadDb();
    return db.wallets.find((w) => w.userId === userId) ?? null;
  },

  updateWalletBalance(userId: string, newBalance: number): StoredWallet | null {
    const db = loadDb();
    const index = db.wallets.findIndex((w) => w.userId === userId);
    if (index === -1) return null;
    db.wallets[index].availableBalance = newBalance;
    saveDb();
    return db.wallets[index];
  },

  createDeposit(deposit: StoredDeposit): StoredDeposit {
    const db = loadDb();
    if (!db.deposits) db.deposits = [];
    db.deposits.unshift(deposit);
    saveDb();
    return deposit;
  },

  getAllDeposits(): StoredDeposit[] {
    const db = loadDb();
    return db.deposits || [];
  },

  approveDeposit(depositId: string): { success: boolean; deposit?: StoredDeposit } {
    const db = loadDb();
    if (!db.deposits) db.deposits = [];
    const index = db.deposits.findIndex((d) => d.id === depositId);
    if (index === -1) return { success: false };

    const deposit = db.deposits[index];
    deposit.status = "APPROVED";
    deposit.reviewedAt = new Date().toISOString();

    // Credit user's wallet
    const wallet = db.wallets.find((w) => w.userId === deposit.userId);
    if (wallet) {
      wallet.availableBalance += deposit.amount;
      wallet.totalDeposited += deposit.amount;
    }

    saveDb();
    return { success: true, deposit };
  },

  rejectDeposit(depositId: string): { success: boolean; deposit?: StoredDeposit } {
    const db = loadDb();
    if (!db.deposits) db.deposits = [];
    const index = db.deposits.findIndex((d) => d.id === depositId);
    if (index === -1) return { success: false };

    const deposit = db.deposits[index];
    deposit.status = "REJECTED";
    deposit.reviewedAt = new Date().toISOString();

    saveDb();
    return { success: true, deposit };
  },

  // --- Extended Admin Methods ---

  getAllUsersWithWallets(): Array<StoredUser & { wallet: StoredWallet | null }> {
    const db = loadDb();
    return db.users.map((u) => {
      const wallet = db.wallets.find((w) => w.userId === u.id) ?? null;
      return { ...u, wallet };
    });
  },

  adjustUserBalance(userId: string, deltaAmount: number, reason: string): { success: boolean; newBalance?: number } {
    const db = loadDb();
    const wallet = db.wallets.find((w) => w.userId === userId);
    if (!wallet) return { success: false };

    wallet.availableBalance += deltaAmount;
    if (deltaAmount > 0) {
      wallet.totalDeposited += deltaAmount;
    }
    saveDb();
    console.log(`💰 [ADMIN BALANCE ADJUSTMENT] User ${userId}: ${deltaAmount > 0 ? "+" : ""}${deltaAmount} ETB (Reason: ${reason}). New balance: ${wallet.availableBalance}`);
    return { success: true, newBalance: wallet.availableBalance };
  },

  getAllCustomMatches(): StoredCustomMatch[] {
    const db = loadDb();
    return db.customMatches || [];
  },

  createCustomMatch(match: StoredCustomMatch): StoredCustomMatch {
    const db = loadDb();
    if (!db.customMatches) db.customMatches = [];
    db.customMatches.unshift(match);
    saveDb();
    return match;
  },

  updateCustomMatch(id: string, updates: Partial<StoredCustomMatch>): StoredCustomMatch | null {
    const db = loadDb();
    if (!db.customMatches) db.customMatches = [];
    const index = db.customMatches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    db.customMatches[index] = { ...db.customMatches[index], ...updates };
    saveDb();
    return db.customMatches[index];
  },

  getAllBets(): StoredPlacedBet[] {
    const db = loadDb();
    return db.bets || [];
  },

  getUserBets(userId: string): StoredPlacedBet[] {
    const db = loadDb();
    return (db.bets || []).filter((b) => b.userId === userId);
  },

  createBet(bet: StoredPlacedBet): { success: boolean; bet?: StoredPlacedBet; error?: string } {
    const db = loadDb();
    if (!db.bets) db.bets = [];
    const wallet = db.wallets.find((w) => w.userId === bet.userId);
    if (!wallet || wallet.availableBalance < bet.stake) {
      return { success: false, error: "Insufficient wallet balance." };
    }
    wallet.availableBalance -= bet.stake;
    db.bets.unshift(bet);
    saveDb();
    return { success: true, bet };
  },

  settleBet(betId: string, status: "WON" | "LOST" | "VOID"): StoredPlacedBet | null {
    const db = loadDb();
    if (!db.bets) db.bets = [];
    const bet = db.bets.find((b) => b.id === betId);
    if (!bet) return null;
    bet.status = status;
    bet.settledAt = new Date().toISOString();
    if (status === "WON") {
      const wallet = db.wallets.find((w) => w.userId === bet.userId);
      if (wallet) {
        wallet.availableBalance += bet.potentialReturn;
      }
    } else if (status === "VOID") {
      const wallet = db.wallets.find((w) => w.userId === bet.userId);
      if (wallet) {
        wallet.availableBalance += bet.stake;
      }
    }
    saveDb();
    return bet;
  },

  getSettings(): PlatformSettings {
    const db = loadDb();
    return (
      db.settings || {
        telebirrNumber: "0941960863",
        cbeAccountNumber: "1000400846271",
        receiverName: "Ezera Hailu",
        welcomeBonus: 50,
        minBetStake: 10,
        maxBetStake: 50000,
        maintenanceMode: false,
      }
    );
  },

  updateSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    const db = loadDb();
    db.settings = { ...this.getSettings(), ...updates };
    saveDb();
    return db.settings;
  },

  createSession(session: StoredSession): void {
    const db = loadDb();
    db.sessions.push(session);
    saveDb();
  },

  getSession(token: string): (StoredSession & { user: StoredUser }) | null {
    const db = loadDb();
    const session = db.sessions.find((s) => s.token === token);
    if (!session || new Date(session.expiresAt) < new Date()) return null;
    const user = db.users.find((u) => u.id === session.userId);
    if (!user || user.status !== "ACTIVE") return null;
    return { ...session, user };
  },

  deleteSession(token: string): void {
    const db = loadDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDb();
  },

  deleteUserSessions(userId: string): void {
    const db = loadDb();
    db.sessions = db.sessions.filter((s) => s.userId !== userId);
    saveDb();
  },

  createWithdrawal(data: {
    userId: string;
    amount: number;
    currency?: string;
    method: string;
    accountNumber: string;
    accountName?: string;
  }): { success: boolean; withdrawalId?: string; error?: string } {
    const db = loadDb();
    if (!db.withdrawals) db.withdrawals = [];
    const wallet = db.wallets.find((w) => w.userId === data.userId && w.mode === "REAL");
    if (!wallet) return { success: false, error: "Wallet not found" };
    if (wallet.availableBalance < data.amount) return { success: false, error: "Insufficient available balance" };

    const user = db.users.find((u) => u.id === data.userId);
    wallet.availableBalance -= data.amount;

    const withdrawal: StoredWithdrawal = {
      id: "wd_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      userId: data.userId,
      userEmail: user?.email || data.userId,
      amount: data.amount,
      currency: data.currency || "ETB",
      method: data.method,
      accountNumber: data.accountNumber,
      accountName: data.accountName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    };

    db.withdrawals.unshift(withdrawal);
    saveDb();
    return { success: true, withdrawalId: withdrawal.id };
  },

  getAllWithdrawals(): StoredWithdrawal[] {
    const db = loadDb();
    return db.withdrawals || [];
  },

  processWithdrawal(id: string, action: "APPROVE" | "REJECT", notes?: string): { success: boolean; message: string } {
    const db = loadDb();
    if (!db.withdrawals) db.withdrawals = [];
    const w = db.withdrawals.find((item) => item.id === id);
    if (!w) return { success: false, message: "Withdrawal not found" };
    if (w.status !== "PENDING") return { success: false, message: "Withdrawal already processed" };

    const wallet = db.wallets.find((item) => item.userId === w.userId && item.mode === "REAL");

    if (action === "APPROVE") {
      w.status = "APPROVED";
      w.processedAt = new Date().toISOString();
      w.notes = notes || "Payout transferred via " + w.method;
      if (wallet) {
        wallet.totalWithdrawn = (wallet.totalWithdrawn || 0) + w.amount;
      }
      saveDb();
      return { success: true, message: `Withdrawal of ${w.amount} ETB marked as PAID to ${w.accountNumber}` };
    } else {
      w.status = "REJECTED";
      w.processedAt = new Date().toISOString();
      w.notes = notes || "Rejected and refunded to wallet";
      if (wallet) {
        wallet.availableBalance += w.amount;
      }
      saveDb();
      return { success: true, message: `Withdrawal rejected and ${w.amount} ETB refunded to user wallet` };
    }
  },
};
