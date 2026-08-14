import type { NormalizedEvent, NormalizedOutcome } from "./odds-normalizer";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Sanity-checks a normalized event before it's written to cache/DB.
// Does not throw — callers decide whether to drop, log, or alert on
// malformed upstream data (spec section 7: "malformed-response handling").
export function validateEvent(event: NormalizedEvent): ValidationResult {
  const errors: string[] = [];

  if (!event.externalId) errors.push("missing externalId");
  if (!event.homeTeam || !event.awayTeam) errors.push("missing team name(s)");
  if (Number.isNaN(new Date(event.commenceTime).getTime())) errors.push("invalid commenceTime");

  for (const market of event.markets) {
    if (market.outcomes.length === 0) {
      errors.push(`market ${market.key}/${market.bookmakerKey} has no outcomes`);
      continue;
    }
    for (const outcome of market.outcomes) {
      errors.push(...validateOutcome(outcome).errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateOutcome(outcome: NormalizedOutcome): ValidationResult {
  const errors: string[] = [];
  const price = Number(outcome.price);

  if (!Number.isFinite(price) || price <= 1) {
    // Decimal odds below 1.0 are not valid — 1.0 would imply zero payout.
    errors.push(`outcome ${outcome.externalId} has invalid price ${outcome.price}`);
  }
  if (!outcome.name) {
    errors.push(`outcome ${outcome.externalId} missing name`);
  }

  return { valid: errors.length === 0, errors };
}

export function isStale(lastUpdated: string, maxAgeSeconds: number): boolean {
  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  return ageMs > maxAgeSeconds * 1000;
}
