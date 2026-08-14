import { describe, it, expect } from "vitest";

// These are documentation-level tests describing the contract
// confirmDeposit() must satisfy. Wiring them to a real test DB (rather than
// mocking Prisma) is the next step before trusting this in production —
// see README "Going to production".
describe("deposit webhook contract", () => {
  it.todo("credits the wallet exactly once for a given providerRef, even if the webhook fires twice");
  it.todo("does not credit the wallet if provider.verifyPayment returns verified: false");
  it.todo("returns success without re-crediting when called on an already-COMPLETED transaction");
  it.todo("writes a WalletTransaction row inside the same DB transaction as the balance update");
});

describe("withdrawal state machine", () => {
  it.todo("locks the requested amount out of availableBalance immediately on request");
  it.todo("on provider failure, moves lockedBalance back to availableBalance (never loses funds)");
  it.todo("on provider success, decrements lockedBalance and increments totalWithdrawn, never touches availableBalance again");
  it.todo("rejects withdrawal when user.kycStatus is not VERIFIED");
});

describe("concurrent bet + withdrawal on the same wallet", () => {
  it.todo("SELECT ... FOR UPDATE prevents a bet placement and a withdrawal from both reading the same pre-lock balance");
});
