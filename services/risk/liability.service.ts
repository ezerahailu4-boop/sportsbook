import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";

export interface RiskCheckInput {
  userId: string;
  totalStake: Decimal;
  potentialReturn: Decimal;
  selections: Array<{
    eventId: string;
    marketKey: string;
    outcomeId: string;
    price: Decimal;
  }>;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  maxAllowedStake?: Decimal;
}

// Configurable platform risk thresholds (can be set via environment or DB)
const MAX_TICKET_PAYOUT = new Decimal(process.env.MAX_TICKET_PAYOUT || "250000.00");
const MAX_EVENT_LIABILITY = new Decimal(process.env.MAX_EVENT_LIABILITY || "500000.00");
const MAX_SINGLE_STAKE = new Decimal(process.env.MAX_SINGLE_STAKE || "25000.00");

export async function evaluateBetRisk(input: RiskCheckInput): Promise<RiskCheckResult> {
  // 1. Max stake threshold check
  if (input.totalStake.greaterThan(MAX_SINGLE_STAKE)) {
    return {
      allowed: false,
      reason: `Maximum allowed stake for this wager is ${MAX_SINGLE_STAKE.toFixed(2)} ETB.`,
      maxAllowedStake: MAX_SINGLE_STAKE,
    };
  }

  // 2. Max ticket payout threshold check
  if (input.potentialReturn.greaterThan(MAX_TICKET_PAYOUT)) {
    const maxStakeForPayout = MAX_TICKET_PAYOUT.dividedBy(input.potentialReturn.dividedBy(input.totalStake)).toDecimalPlaces(2);
    return {
      allowed: false,
      reason: `Potential return exceeds maximum allowable payout limit of ${MAX_TICKET_PAYOUT.toFixed(2)} ETB.`,
      maxAllowedStake: maxStakeForPayout,
    };
  }

  // 3. Match exposure liability check
  for (const sel of input.selections) {
    // Calculate current open liability on this outcome
    const openBets = await prisma.betSelection.findMany({
      where: {
        eventId: sel.eventId,
        marketKey: sel.marketKey,
        outcomeId: sel.outcomeId,
        bet: { status: "PENDING" },
      },
      include: { bet: { select: { potentialReturn: true } } },
      take: 100,
    });

    const currentLiability = openBets.reduce(
      (sum, b) => sum.plus(new Decimal(b.bet.potentialReturn.toString())),
      new Decimal(0)
    );

    const projectedLiability = currentLiability.plus(input.potentialReturn);
    if (projectedLiability.greaterThan(MAX_EVENT_LIABILITY)) {
      return {
        allowed: false,
        reason: "This market has reached maximum sportsbook risk exposure. Stake limit reduced.",
      };
    }
  }

  return { allowed: true };
}
