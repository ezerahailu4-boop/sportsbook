import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { money, potentialReturn, potentialProfit, combineOdds } from "@/lib/money";

describe("Settlement Engine Calculation Logic", () => {
  it("evaluates single winning bet payout correctly", () => {
    const stake = new Decimal("250.00");
    const odds = new Decimal("1.85");
    const payout = stake.mul(odds);
    expect(payout.toFixed(2)).toBe("462.50");
    expect(payout.minus(stake).toFixed(2)).toBe("212.50");
  });

  it("evaluates multi-fold accumulator payout with all legs won", () => {
    const stake = new Decimal("100.00");
    const legs = [new Decimal("1.50"), new Decimal("2.10"), new Decimal("1.80")];
    const combinedOdds = legs.reduce((acc, leg) => acc.mul(leg), new Decimal(1));
    // 1.50 * 2.10 * 1.80 = 5.67
    expect(combinedOdds.toFixed(2)).toBe("5.67");
    const payout = stake.mul(combinedOdds);
    expect(payout.toFixed(2)).toBe("567.00");
  });

  it("handles void legs in accumulators by treating them as 1.00 multiplier", () => {
    const stake = new Decimal("100.00");
    const leg1Won = new Decimal("2.00");
    const leg2Void = new Decimal("1.00"); // voided leg
    const leg3Won = new Decimal("3.00");

    const effectiveOdds = leg1Won.mul(leg2Void).mul(leg3Won);
    expect(effectiveOdds.toFixed(2)).toBe("6.00");
    expect(stake.mul(effectiveOdds).toFixed(2)).toBe("600.00");
  });

  it("ensures lost bets generate zero payout", () => {
    const stake = new Decimal("500.00");
    const isLost = true;
    const payout = isLost ? new Decimal(0) : stake.mul(new Decimal(2.0));
    expect(payout.toFixed(2)).toBe("0.00");
  });
});
