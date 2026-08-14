import { PrismaClient, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { validateBetRequest, type PlaceBetRequest, type ValidationResult } from "./bet-validation.service";

const prisma = new PrismaClient();

export type PlaceBetResult =
  | { success: true; betId: string }
  | { success: false; error: { code: string; message: string }; updatedOdds?: unknown };

// The only function that should ever create a Bet row. Wraps validation +
// wallet debit + bet + selections in one Postgres transaction so a crash
// mid-way never leaves stake deducted without a bet, or vice versa.
export async function placeBet(req: PlaceBetRequest): Promise<PlaceBetResult> {
  // Idempotency: if this exact request already succeeded, return the same
  // result instead of placing the bet twice (spec section 53).
  const existing = await prisma.bet.findUnique({ where: { idempotencyKey: req.idempotencyKey } });
  if (existing) {
    return { success: true, betId: existing.id };
  }

  const validation: ValidationResult = await validateBetRequest(req);
  if (!validation.success) {
    return { success: false, error: validation.error, updatedOdds: validation.updatedOdds };
  }

  try {
    const betId = await prisma.$transaction(async (tx) => {
      // Row-lock the wallet for this user to prevent concurrent bet placements
      // (or a bet + withdrawal race) from double-spending the same balance.
      const wallet = await tx.$queryRaw<Array<{ id: string; availableBalance: string }>>`
        SELECT id, "availableBalance" FROM "Wallet"
        WHERE "userId" = ${req.userId} AND mode = 'DEMO'
        FOR UPDATE
      `;
      if (!wallet[0]) throw new Error("WALLET_NOT_FOUND");

      const currentBalance = new Prisma.Decimal(wallet[0].availableBalance);
      const stake = new Prisma.Decimal(validation.stake.toString());
      if (currentBalance.lessThan(stake)) throw new Error("INSUFFICIENT_BALANCE");

      const bet = await tx.bet.create({
        data: {
          userId: req.userId,
          betType: req.betType,
          stake: stake,
          combinedOdds: new Prisma.Decimal(validation.combinedOdds.toString()),
          potentialReturn: new Prisma.Decimal(validation.potentialReturn.toString()),
          potentialProfit: new Prisma.Decimal(validation.potentialProfit.toString()),
          status: "PENDING",
          idempotencyKey: req.idempotencyKey,
          selections: {
            create: validation.resolvedSelections.map((s) => ({
              eventId: s.eventId,
              marketKey: s.marketKey,
              outcomeId: s.outcomeId,
              bookmakerKey: s.bookmakerKey,
              selectionName: s.selectionName,
              oddsAtPlacement: new Prisma.Decimal(s.currentPrice.toString()),
              point: s.point ? new Prisma.Decimal(s.point) : null,
              eventStartTime: s.eventStartTime,
              status: "PENDING",
            })),
          },
        },
      });

      await tx.wallet.update({
        where: { id: wallet[0].id },
        data: { availableBalance: { decrement: stake } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet[0].id,
          type: "BET_STAKE",
          amount: stake.negated(),
          currency: "ETB",
          status: "COMPLETED",
          reference: `bet_stake_${bet.id}`,
          idempotencyKey: `${req.idempotencyKey}_stake`,
          betId: bet.id,
          completedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          actorType: "user",
          action: "BET_PLACED",
          targetType: "Bet",
          targetId: bet.id,
          metadata: { stake: stake.toString(), combinedOdds: validation.combinedOdds.toString() },
        },
      });

      return bet.id;
    });

    return { success: true, betId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message === "INSUFFICIENT_BALANCE") {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance. Deposit funds to continue." } };
    }
    if (message === "WALLET_NOT_FOUND") {
      return { success: false, error: { code: "WALLET_NOT_FOUND", message: "No demo wallet found for this account." } };
    }
    console.error("placeBet transaction failed:", err);
    return { success: false, error: { code: "PLACEMENT_FAILED", message: "Failed to place bet. Please try again." } };
  }
}

export function newIdempotencyKey(): string {
  return randomUUID();
}
