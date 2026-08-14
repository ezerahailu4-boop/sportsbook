// Exact decimal arithmetic for all currency and odds math.
// Never use native JS number arithmetic (+, -, *, /) on money or odds values.
import Decimal from "decimal.js";

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_EVEN });

export type Money = Decimal;

export function money(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function toMoneyDecimal(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function addMoney(a: Money, b: Money): Money {
  return a.plus(b);
}

export function subtractMoney(a: Money, b: Money): Money {
  return a.minus(b);
}

// Decimal-odds potential return: stake * combinedOdds
export function potentialReturn(stake: Money, combinedOdds: Money): Money {
  return stake.times(combinedOdds).toDecimalPlaces(2);
}

export function potentialProfit(stake: Money, combinedOdds: Money): Money {
  return potentialReturn(stake, combinedOdds).minus(stake);
}

// Combine decimal odds across selections for an accumulator/multiple bet.
export function combineOdds(prices: Money[]): Money {
  return prices.reduce((acc, p) => acc.times(p), new Decimal(1)).toDecimalPlaces(4);
}

export function multiplyOddsDecimals(prices: string[]): string {
  if (prices.length === 0) return "1.00";
  return prices
    .reduce((acc, p) => acc.times(new Decimal(p || 1)), new Decimal(1))
    .toDecimalPlaces(2)
    .toString();
}

export function toDisplayString(value: Money, decimals = 2): string {
  return value.toFixed(decimals);
}

export function isPositive(value: Money): boolean {
  return value.greaterThan(0);
}
