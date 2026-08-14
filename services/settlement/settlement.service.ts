import { PrismaClient, Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { toMoneyDecimal } from "@/lib/money";
import { logger } from "@/lib/logger";

export interface OutcomeResult {
  outcomeId: string;
  status: "WON" | "LOST" | "VOID";
}

export interface MatchSettlementResult {
  eventId: string;
  marketKey: string;
  outcomeResults: OutcomeResult[];
  reason?: string;
}

export interface SettleBatchReport {
  settledSelections: number;
  settledBets: number;
  wonBets: number;
  lostBets: number;
  voidBets: number;
  totalPayoutDistributed: string;
}

/**
 * Authoritative settlement engine.
 * Never settles based on client/browser data.
 * When event results are officially finalized, resolves BetSelections,
 * evaluates full Bets (singles & multiples/accumulators), and atomically
 * executes ledger updates for payouts (BET_WIN) or refunds (BET_REFUND).
 */
export async function settleMatchMarket(
  settlement: MatchSettlementResult,
  prisma: PrismaClient = defaultPrisma
): Promise<SettleBatchReport> {
  logger.info("Starting match market settlement", { eventId: settlement.eventId, marketKey: settlement.marketKey });

  let settledSelectionsCount = 0;
  let wonBetsCount = 0;
  let lostBetsCount = 0;
  let voidBetsCount = 0;
  let totalPayout = new Prisma.Decimal(0);

  // 1. Find all pending bet selections for this event and market
  const pendingSelections = await prisma.betSelection.findMany({
    where: {
      eventId: settlement.eventId,
      marketKey: settlement.marketKey,
      status: "PENDING",
    },
    include: {
      bet: {
        include: {
          selections: true,
          user: true,
        },
      },
    },
  });

  const outcomeStatusMap = new Map<string, "WON" | "LOST" | "VOID">();
  for (const res of settlement.outcomeResults) {
    outcomeStatusMap.set(res.outcomeId, res.status);
  }

  // Group affected bet IDs to evaluate bets after selection updates
  const affectedBetIds = new Set<string>();

  // 2. Update selection statuses in DB
  for (const selection of pendingSelections) {
    const newStatus = outcomeStatusMap.get(selection.outcomeId) ?? "LOST";
    await prisma.betSelection.update({
      where: { id: selection.id },
      data: { status: newStatus },
    });
    settledSelectionsCount++;
    affectedBetIds.add(selection.betId);
  }

  // 3. Evaluate each affected bet atomically
  for (const betId of affectedBetIds) {
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        selections: true,
        user: {
          include: {
            wallets: {
              where: { mode: "DEMO", currency: "ETB" },
            },
          },
        },
      },
    });

    if (!bet || bet.status !== "PENDING") continue;

    // Check if all selections in this bet are settled
    const anyPending = bet.selections.some((s) => s.status === "PENDING");
    if (anyPending) {
      // In an accumulator, if one leg is definitely LOST, the entire accumulator is LOST immediately
      const hasLost = bet.selections.some((s) => s.status === "LOST");
      if (hasLost) {
        await prisma.bet.update({
          where: { id: bet.id },
          data: { status: "LOST", settledAt: new Date() },
        });
        lostBetsCount++;
      }
      continue;
    }

    // All selections are settled. Calculate outcome.
    const allWon = bet.selections.every((s) => s.status === "WON");
    const anyLost = bet.selections.some((s) => s.status === "LOST");
    const allVoid = bet.selections.every((s) => s.status === "VOID");

    if (anyLost) {
      // Bet is LOST
      await prisma.bet.update({
        where: { id: bet.id },
        data: { status: "LOST", settledAt: new Date() },
      });
      lostBetsCount++;
    } else if (allVoid) {
      // All selections voided -> refund full stake
      await prisma.$transaction(async (tx) => {
        const wallet = bet.user.wallets[0];
        if (!wallet) throw new Error("Wallet not found for bet refund");

        await tx.bet.update({
          where: { id: bet.id },
          data: { status: "VOID", settledAt: new Date() },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { availableBalance: { increment: bet.stake } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "BET_REFUND",
            amount: bet.stake,
            currency: wallet.currency,
            status: "COMPLETED",
            reference: `refund_bet_${bet.id}`,
            idempotencyKey: `refund_${bet.id}_${Date.now()}`,
            betId: bet.id,
            completedAt: new Date(),
            metadata: { reason: settlement.reason ?? "Event cancelled/voided" },
          },
        });
      });
      voidBetsCount++;
      totalPayout = totalPayout.plus(bet.stake);
    } else {
      // Bet is WON (or won with partial void legs in accumulator)
      let effectiveOdds = new Prisma.Decimal(1);
      for (const s of bet.selections) {
        if (s.status === "WON") {
          effectiveOdds = effectiveOdds.mul(s.oddsAtPlacement);
        }
        // VOID legs count as 1.00x multiplier
      }

      const payout = bet.stake.mul(effectiveOdds);

      await prisma.$transaction(async (tx) => {
        const wallet = bet.user.wallets[0];
        if (!wallet) throw new Error("Wallet not found for bet payout");

        await tx.bet.update({
          where: { id: bet.id },
          data: { status: "WON", settledAt: new Date() },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalance: { increment: payout },
            totalWinnings: { increment: payout },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "BET_WIN",
            amount: payout,
            currency: wallet.currency,
            status: "COMPLETED",
            reference: `win_bet_${bet.id}`,
            idempotencyKey: `win_${bet.id}_${Date.now()}`,
            betId: bet.id,
            completedAt: new Date(),
            metadata: { effectiveOdds: effectiveOdds.toString() },
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: bet.userId,
            actorType: "system",
            action: "BET_SETTLED_WON",
            targetType: "Bet",
            targetId: bet.id,
            metadata: { payout: payout.toString(), stake: bet.stake.toString() },
          },
        });
      });

      wonBetsCount++;
      totalPayout = totalPayout.plus(payout);
    }
  }

  return {
    settledSelections: settledSelectionsCount,
    settledBets: affectedBetIds.size,
    wonBets: wonBetsCount,
    lostBets: lostBetsCount,
    voidBets: voidBetsCount,
    totalPayoutDistributed: totalPayout.toFixed(2),
  };
}
