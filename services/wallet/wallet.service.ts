import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { getPaymentProvider } from "@/services/payments/payment-factory";
import type { PaymentProvider } from "@/services/payments/payment-provider";

function getProvider(): PaymentProvider {
  return getPaymentProvider();
}

export function getActiveWalletMode(): "REAL" | "DEMO" {
  return process.env.REAL_MONEY_ENABLED === "true" ? "REAL" : "DEMO";
}

export interface StartDepositRequest {
  userId: string;
  amount: string;
  currency: string;
  idempotencyKey: string;
}

export type StartDepositResult =
  | { success: true; checkoutUrl?: string; transactionId: string }
  | { success: false; error: { code: string; message: string } };

// Step 1 of the deposit flow: creates a PENDING PaymentTransaction and asks
// the provider for a checkout session. The wallet is NOT credited here —
// only the webhook handler (confirmDeposit) credits it, and only once,
// after verifying the provider's callback (spec section 24).
export async function startDeposit(req: StartDepositRequest): Promise<StartDepositResult> {
  const amount = new Prisma.Decimal(req.amount);
  if (amount.lessThanOrEqualTo(0)) {
    return { success: false, error: { code: "INVALID_AMOUNT", message: "Deposit amount must be greater than zero." } };
  }

  const existing = await prisma.paymentTransaction.findUnique({ where: { idempotencyKey: req.idempotencyKey } });
  if (existing) {
    return { success: true, transactionId: existing.id };
  }

  const provider = getProvider();
  const providerResponse = await provider.createDeposit({
    userId: req.userId,
    amount: req.amount,
    currency: req.currency,
    idempotencyKey: req.idempotencyKey,
  });

  const tx = await prisma.paymentTransaction.create({
    data: {
      userId: req.userId,
      type: "deposit",
      amount,
      currency: req.currency,
      status: "PENDING",
      provider: "mock",
      providerRef: providerResponse.providerRef,
      idempotencyKey: req.idempotencyKey,
    },
  });

  return { success: true, checkoutUrl: providerResponse.checkoutUrl, transactionId: tx.id };
}

export interface ConfirmDepositRequest {
  providerRef: string;
  signature?: string;
  rawPayload: unknown;
}

export type ConfirmDepositResult =
  | { success: true; creditedAmount: string }
  | { success: false; error: { code: string; message: string } };

// Called only from the webhook route. Verifies the payment, then credits
// the wallet exactly once inside a DB transaction — the PaymentTransaction's
// unique providerRef plus a status check prevent double-crediting on replay.
export async function confirmDeposit(req: ConfirmDepositRequest): Promise<ConfirmDepositResult> {
  const provider = getProvider();
  const verification = await provider.verifyPayment(req);

  if (!verification.verified || verification.status !== "COMPLETED") {
    return { success: false, error: { code: "VERIFICATION_FAILED", message: "Could not verify this payment." } };
  }

  const tx = await prisma.paymentTransaction.findUnique({ where: { providerRef: req.providerRef } });
  if (!tx) {
    return { success: false, error: { code: "TRANSACTION_NOT_FOUND", message: "No matching pending deposit found." } };
  }
  if (tx.status === "COMPLETED") {
    // Already processed — this is a webhook replay, not an error.
    return { success: true, creditedAmount: tx.amount.toString() };
  }

  try {
    await prisma.$transaction(async (dbTx) => {
      const wallet = await dbTx.wallet.upsert({
        where: { userId_mode_currency: { userId: tx.userId, mode: "DEMO", currency: tx.currency } },
        update: {},
        create: { userId: tx.userId, mode: "DEMO", currency: tx.currency },
      });

      await dbTx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { increment: tx.amount },
          totalDeposited: { increment: tx.amount },
        },
      });

      await dbTx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: tx.amount,
          currency: tx.currency,
          status: "COMPLETED",
          reference: `deposit_${tx.id}`,
          provider: tx.provider,
          idempotencyKey: `${tx.idempotencyKey}_credit`,
          completedAt: new Date(),
        },
      });

      await dbTx.paymentTransaction.update({
        where: { id: tx.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      await dbTx.auditLog.create({
        data: {
          actorId: tx.userId,
          actorType: "system",
          action: "DEPOSIT_CREDITED",
          targetType: "PaymentTransaction",
          targetId: tx.id,
          metadata: { amount: tx.amount.toString(), provider: tx.provider },
        },
      });
    });

    return { success: true, creditedAmount: tx.amount.toString() };
  } catch (err) {
    console.error("confirmDeposit transaction failed:", err);
    return { success: false, error: { code: "CREDIT_FAILED", message: "Failed to credit wallet." } };
  }
}

export interface StartWithdrawalRequest {
  userId: string;
  amount: string;
  currency: string;
  method: string;
  destination: string;
  idempotencyKey: string;
}

export type StartWithdrawalResult =
  | { success: true; withdrawalId: string }
  | { success: false; error: { code: string; message: string } };

// Locks the requested amount out of availableBalance immediately (so it
// can't be spent on a bet while the withdrawal is processing), then hands
// off to the provider. Full AVAILABLE -> LOCKED -> PROCESSING -> COMPLETED
// state machine per spec section 27.
export async function startWithdrawal(req: StartWithdrawalRequest): Promise<StartWithdrawalResult> {
  const amount = new Prisma.Decimal(req.amount);
  if (amount.lessThanOrEqualTo(0)) {
    return { success: false, error: { code: "INVALID_AMOUNT", message: "Withdrawal amount must be greater than zero." } };
  }

  const existing = await prisma.withdrawal.findUnique({ where: { idempotencyKey: req.idempotencyKey } });
  if (existing) {
    return { success: true, withdrawalId: existing.id };
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.status !== "ACTIVE") {
    return { success: false, error: { code: "ACCOUNT_RESTRICTED", message: "Your account cannot withdraw right now." } };
  }
  if (user.kycStatus !== "VERIFIED") {
    return { success: false, error: { code: "KYC_REQUIRED", message: "Identity verification is required before withdrawing." } };
  }

  const rgSettings = await prisma.responsibleGamblingSetting.findUnique({ where: { userId: req.userId } });
  if (rgSettings?.selfExclusionUntil && rgSettings.selfExclusionUntil > new Date()) {
    return { success: false, error: { code: "ACCOUNT_RESTRICTED", message: "Self-exclusion is currently active on your account." } };
  }

  try {
    const withdrawalId = await prisma.$transaction(async (tx) => {
      const walletRows = await tx.$queryRaw<Array<{ id: string; availableBalance: string }>>`
        SELECT id, "availableBalance" FROM "Wallet"
        WHERE "userId" = ${req.userId} AND mode = 'DEMO' AND currency = ${req.currency}
        FOR UPDATE
      `;
      if (!walletRows[0]) throw new Error("WALLET_NOT_FOUND");

      const balance = new Prisma.Decimal(walletRows[0].availableBalance);
      if (balance.lessThan(amount)) throw new Error("INSUFFICIENT_BALANCE");

      await tx.wallet.update({
        where: { id: walletRows[0].id },
        data: { availableBalance: { decrement: amount }, lockedBalance: { increment: amount } },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: req.userId,
          amount,
          currency: req.currency,
          method: req.method,
          status: "PENDING",
          idempotencyKey: req.idempotencyKey,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: walletRows[0].id,
          type: "WITHDRAWAL",
          amount: amount.negated(),
          currency: req.currency,
          status: "PENDING",
          reference: `withdrawal_${withdrawal.id}`,
          idempotencyKey: `${req.idempotencyKey}_debit`,
        },
      });

      return withdrawal.id;
    });

    const provider = getProvider();
    const providerResponse = await provider.createWithdrawal({
      userId: req.userId,
      amount: req.amount,
      currency: req.currency,
      destination: req.destination,
      idempotencyKey: req.idempotencyKey,
    });

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "PROCESSING", provider: "mock", providerRef: providerResponse.providerRef },
    });

    return { success: true, withdrawalId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message === "INSUFFICIENT_BALANCE") {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance." } };
    }
    if (message === "WALLET_NOT_FOUND") {
      return { success: false, error: { code: "WALLET_NOT_FOUND", message: "No wallet found for this currency." } };
    }
    console.error("startWithdrawal failed:", err);
    return { success: false, error: { code: "WITHDRAWAL_FAILED", message: "Failed to start withdrawal." } };
  }
}

// Called when the provider confirms completion or failure. On failure,
// reverses the lock: LOCKED -> FAILED -> AVAILABLE (spec section 27).
export async function settleWithdrawal(withdrawalId: string, outcome: "COMPLETED" | "FAILED", failureReason?: string) {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal || withdrawal.status !== "PROCESSING") return;

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst({ where: { userId: withdrawal.userId, mode: "DEMO", currency: withdrawal.currency } });
    if (!wallet) return;

    if (outcome === "COMPLETED") {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { lockedBalance: { decrement: withdrawal.amount }, totalWithdrawn: { increment: withdrawal.amount } },
      });
      await tx.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "COMPLETED", processedAt: new Date() } });
    } else {
      // Reverse the lock back into available balance.
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { lockedBalance: { decrement: withdrawal.amount }, availableBalance: { increment: withdrawal.amount } },
      });
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "FAILED", failureReason, processedAt: new Date() },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: withdrawal.userId,
        actorType: "system",
        action: `WITHDRAWAL_${outcome}`,
        targetType: "Withdrawal",
        targetId: withdrawal.id,
        metadata: { amount: withdrawal.amount.toString(), failureReason },
      },
    });
  });
}

export function newIdempotencyKey(): string {
  return randomUUID();
}
