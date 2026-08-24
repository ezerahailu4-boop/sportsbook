import { describe, it, expect } from "vitest";
import { PlaceBetSchema, DepositSchema, WithdrawalSchema, RegisterSchema } from "@/lib/validation";

describe("Input Validation Schemas", () => {
  it("validates valid single bet placement payload", () => {
    const validBet = {
      betType: "SINGLE",
      stake: "150.00",
      idempotencyKey: "test_key_123",
      selections: [
        {
          eventId: "event_1",
          marketKey: "h2h",
          outcomeId: "outcome_1",
          bookmakerKey: "demo_book",
          submittedPrice: "1.95",
        },
      ],
    };

    const parsed = PlaceBetSchema.safeParse(validBet);
    expect(parsed.success).toBe(true);
  });

  it("rejects bet with zero or negative stake", () => {
    const invalidBet = {
      betType: "SINGLE",
      stake: "0",
      idempotencyKey: "test_key_123",
      selections: [
        {
          eventId: "event_1",
          marketKey: "h2h",
          outcomeId: "outcome_1",
          bookmakerKey: "demo_book",
          submittedPrice: "1.95",
        },
      ],
    };

    const parsed = PlaceBetSchema.safeParse(invalidBet);
    expect(parsed.success).toBe(false);
  });

  it("validates valid deposit input", () => {
    const deposit = {
      amount: 500,
      currency: "ETB",
      paymentMethod: "mock_telebirr",
      idempotencyKey: "dep_uuid_1",
    };

    const parsed = DepositSchema.safeParse(deposit);
    expect(parsed.success).toBe(true);
  });

  it("validates valid withdrawal input", () => {
    const withdrawal = {
      amount: 1000,
      currency: "ETB",
      method: "mock_telebirr",
      accountNumber: "+251911223344",
      idempotencyKey: "wth_uuid_1",
    };

    const parsed = WithdrawalSchema.safeParse(withdrawal);
    expect(parsed.success).toBe(true);
  });

  it("rejects registration with password shorter than 10 chars", () => {
    const reg = {
      firstName: "Valid",
      lastName: "User",
      email: "valid@example.com",
      password: "Short8!",
      dateOfBirth: "1995-01-01",
      country: "ET",
      termsAccepted: true,
    };

    const parsed = RegisterSchema.safeParse(reg);
    expect(parsed.success).toBe(false);
  });

  it("accepts registration with valid 10+ char password and valid details", () => {
    const reg = {
      firstName: "Valid",
      lastName: "User",
      email: "valid@example.com",
      password: "StrongPassword123!",
      dateOfBirth: "1995-01-01",
      country: "ET",
      termsAccepted: true,
    };

    const parsed = RegisterSchema.safeParse(reg);
    expect(parsed.success).toBe(true);
  });
});
