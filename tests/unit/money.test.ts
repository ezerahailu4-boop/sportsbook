import { describe, it, expect } from "vitest";
import { money, combineOdds, potentialReturn, potentialProfit, addMoney, subtractMoney } from "@/lib/money";

describe("money arithmetic", () => {
  it("adds decimals exactly, without float drift", () => {
    expect(addMoney(money("100.10"), money("20.25")).toString()).toBe("120.35");
  });

  it("subtracts decimals exactly", () => {
    expect(subtractMoney(money("120.35"), money("20.35")).toString()).toBe("100");
  });
});

describe("single bet calculation", () => {
  it("computes return and profit for decimal odds", () => {
    const stake = money("100");
    const odds = money("1.50");
    expect(potentialReturn(stake, odds).toString()).toBe("150");
    expect(potentialProfit(stake, odds).toString()).toBe("50");
  });
});

describe("accumulator odds", () => {
  it("multiplies decimal odds across selections", () => {
    const combined = combineOdds([money("1.50"), money("1.80"), money("2.00")]);
    // 1.50 * 1.80 * 2.00 = 5.4000
    expect(combined.toString()).toBe("5.4");
  });

  it("computes payout on combined odds", () => {
    const combined = combineOdds([money("1.50"), money("1.80"), money("2.00")]);
    const stake = money("100");
    expect(potentialReturn(stake, combined).toString()).toBe("540");
  });
});
