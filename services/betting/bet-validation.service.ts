import { PrismaClient } from "@prisma/client";
import { money, combineOdds, potentialReturn, potentialProfit, isPositive, type Money } from "@/lib/money";
import { checkCanBet } from "./responsible-gambling.service";

const prisma = new PrismaClient();

export interface RequestedSelection {
  eventId: string; // internal Event.id
  marketKey: string;
  outcomeId: string; // internal Outcome.id
  bookmakerKey: string;
  submittedPrice: string; // what the client displayed — never trusted
}

export interface PlaceBetRequest {
  userId: string;
  betType: "SINGLE" | "MULTIPLE";
  stake: string;
  selections: RequestedSelection[];
  idempotencyKey: string;
}

export type ValidationFailureCode =
  | "UNAUTHENTICATED"
  | "EMPTY_SELECTIONS"
  | "INVALID_STAKE"
  | "EVENT_NOT_FOUND"
  | "EVENT_STARTED"
  | "OUTCOME_NOT_FOUND"
  | "OUTCOME_INACTIVE"
  | "ODDS_CHANGED"
  | "INSUFFICIENT_BALANCE"
  | "ACCOUNT_RESTRICTED"
  | "LIMIT_EXCEEDED";

export interface ValidationFailure {
  success: false;
  error: { code: ValidationFailureCode; message: string };
  updatedOdds?: Array<{ outcomeId: string; oldPrice: string; newPrice: string }>;
}

export interface ValidationSuccess {
  success: true;
  resolvedSelections: Array<{
    eventId: string;
    marketKey: string;
    outcomeId: string;
    bookmakerKey: string;
    selectionName: string;
    currentPrice: Money;
    point: string | null;
    eventStartTime: Date;
  }>;
  combinedOdds: Money;
  stake: Money;
  potentialReturn: Money;
  potentialProfit: Money;
}

export type ValidationResult = ValidationFailure | ValidationSuccess;

// Re-derives every number from the database. The frontend's displayed odds,
// combined odds, and payout are advisory only — this function is the only
// place that produces numbers actually used to place and pay out a bet.
export async function validateBetRequest(req: PlaceBetRequest): Promise<ValidationResult> {
  if (!req.userId) {
    return { success: false, error: { code: "UNAUTHENTICATED", message: "You must be logged in to place a bet." } };
  }

  if (!req.selections || req.selections.length === 0) {
    return { success: false, error: { code: "EMPTY_SELECTIONS", message: "Your bet slip is empty." } };
  }

  const stake = money(req.stake);
  if (!isPositive(stake)) {
    return { success: false, error: { code: "INVALID_STAKE", message: "Stake must be greater than zero." } };
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.status !== "ACTIVE") {
    return { success: false, error: { code: "ACCOUNT_RESTRICTED", message: "Your account cannot place bets right now." } };
  }

  const rgCheck = await checkCanBet(req.userId, req.stake);
  if (!rgCheck.allowed) {
    return { success: false, error: { code: "ACCOUNT_RESTRICTED", message: rgCheck.reason ?? "Betting is currently restricted on your account." } };
  }

  const resolvedSelections: ValidationSuccess["resolvedSelections"] = [];
  const oddsChanges: Array<{ outcomeId: string; oldPrice: string; newPrice: string }> = [];

  for (const sel of req.selections) {
    const event = await prisma.event.findUnique({ where: { id: sel.eventId } });
    if (!event) {
      return { success: false, error: { code: "EVENT_NOT_FOUND", message: "One of the selected events no longer exists." } };
    }
    if (event.commenceTime <= new Date()) {
      return { success: false, error: { code: "EVENT_STARTED", message: `${event.homeTeam} vs ${event.awayTeam} has already started.` } };
    }

    const outcome = await prisma.outcome.findUnique({
      where: { id: sel.outcomeId },
      include: { market: true },
    });
    if (!outcome || outcome.market.eventId !== event.id) {
      return { success: false, error: { code: "OUTCOME_NOT_FOUND", message: "One of your selections is no longer available." } };
    }

    const currentPrice = money(outcome.price.toString());
    const submittedPrice = money(sel.submittedPrice);

    if (!currentPrice.equals(submittedPrice)) {
      oddsChanges.push({
        outcomeId: outcome.id,
        oldPrice: submittedPrice.toString(),
        newPrice: currentPrice.toString(),
      });
    }

    resolvedSelections.push({
      eventId: event.id,
      marketKey: outcome.market.key,
      outcomeId: outcome.id,
      bookmakerKey: outcome.market.bookmakerKey,
      selectionName: outcome.name,
      currentPrice,
      point: outcome.point ? outcome.point.toString() : null,
      eventStartTime: event.commenceTime,
    });
  }

  if (oddsChanges.length > 0) {
    return {
      success: false,
      error: { code: "ODDS_CHANGED", message: "One or more odds have changed." },
      updatedOdds: oddsChanges,
    };
  }

  const combined =
    req.betType === "SINGLE"
      ? resolvedSelections[0].currentPrice
      : combineOdds(resolvedSelections.map((s) => s.currentPrice));

  const returnAmount = potentialReturn(stake, combined);
  const profitAmount = potentialProfit(stake, combined);

  const wallet = await prisma.wallet.findFirst({ where: { userId: req.userId, mode: "DEMO" } });
  if (!wallet || money(wallet.availableBalance.toString()).lessThan(stake)) {
    return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance. Deposit funds to continue." } };
  }

  return {
    success: true,
    resolvedSelections,
    combinedOdds: combined,
    stake,
    potentialReturn: returnAmount,
    potentialProfit: profitAmount,
  };
}
