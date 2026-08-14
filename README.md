# ApexBet Sportsbook Platform (Prototype / Demo Architecture)

A production-quality, modern, responsive sportsbook web application and modular betting architecture. Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM (PostgreSQL)**, **Zustand**, and **The Odds API v4**.

---

## 🌟 Key Architecture & Design Highlights

1. **Authoritative Server Engine**:
   - The client/browser is never authoritative for odds, payouts, wallet balances, or bet outcomes.
   - Every bet placement is verified server-side against live odds feeds with automatic drift detection (`ODDS_CHANGED`).

2. **Append-Only Financial Ledger**:
   - The wallet balance is derived from and maintained by an immutable [`WalletTransaction`](prisma/schema.prisma) ledger.
   - All financial mutations (Stakes, Wins, Refunds, Deposits, Withdrawals) occur within PostgreSQL transactions with row-level locks (`SELECT ... FOR UPDATE`).
   - Uses `decimal.js` for exact financial precision without IEEE-754 floating-point drift.

3. **Authoritative Settlement Engine**:
   - Official event results are resolved independently from display odds.
   - Evaluates Single and Multi-fold Accumulator bets atomically, crediting winning payouts (`BET_WIN`) or void refunds (`BET_REFUND`).

4. **The Odds API v4 Integration & Demo Mode**:
   - Connects to official v4 endpoints (`GET /v4/sports`, `GET /v4/sports/{sport}/odds`).
   - When `ODDS_API_KEY` is unset, automatically operates in **DEMO MODE** with comprehensive mock fixtures, live match simulations, and mock payment gateways.

5. **Responsible Gaming & Compliance**:
   - Built-in configurable limits for daily deposits, losses, and session durations.
   - Cooling-off periods and self-exclusion gates enforced server-side.

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sportsbook"

# The Odds API (https://the-odds-api.com) — leave empty for Demo Mode
ODDS_API_KEY=

# Session Crypto Secret
AUTH_SECRET="your-secure-random-auth-secret"

# Redis Cache URL (optional, in-memory fallback included)
REDIS_URL="redis://localhost:6379"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payment Gateway Abstraction
PAYMENT_PROVIDER=
PAYMENT_PROVIDER_API_KEY=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=

# Feature Gate (Real-Money Wagering disabled until licensed)
REAL_MONEY_ENABLED=false
```

### 3. Generate Database Client & Seed
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demo Credentials

- **Demo Bettor User**:
  - Email: `user@sportsbook.demo`
  - Password: `User1234!`
  - Initial Balance: `5,000.00 ETB` (Demo Wallet)
- **Admin Operator**:
  - Email: `admin@sportsbook.demo`
  - Password: `Admin1234!`
  - Access: Full Operations Center at `/admin`

---

## 🧪 Running Automated Tests

Run the test suite via Vitest:
```bash
npx vitest run tests/unit
```

Tests cover:
- Decimal money arithmetic & odds multiplication
- Accumulator payout calculation & void leg rules
- Input validation (Zod schemas for bets, deposits, withdrawals, age verification)
- Wallet ledger credit/debit state machines

---

## 🛡️ Going to Production Checklist

Before enabling `REAL_MONEY_ENABLED=true`, the following are mandatory:
1. Valid sports betting and gaming license for target jurisdiction(s).
2. Production KYC/AML identity verification provider adapter.
3. Authoritative sports settlement and results feed.
4. Licensed payment provider adapter (Telebirr, CBE, Stripe, etc.) with webhook signature verification.
5. Independent penetration testing and financial ledger concurrency audit.
