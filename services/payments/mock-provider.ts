import { randomUUID } from "crypto";
import type {
  PaymentProvider,
  CreateDepositInput,
  PaymentResponse,
  VerifyPaymentInput,
  PaymentVerification,
  CreateWithdrawalInput,
  WithdrawalResponse,
  VerifyWithdrawalInput,
  WithdrawalVerification,
} from "./payment-provider";

// DEMO MODE ONLY. Simulates a payment provider so the full deposit/withdrawal
// flow can be exercised end-to-end without a licensed payment integration.
// Auto-approves everything after a short simulated delay. Never wire this
// into a build where REAL_MONEY_ENABLED=true.
export class MockPaymentProvider implements PaymentProvider {
  async createDeposit(input: CreateDepositInput): Promise<PaymentResponse> {
    const providerRef = `mock_dep_${randomUUID()}`;
    return {
      providerRef,
      checkoutUrl: `/wallet/deposit/mock-checkout?ref=${providerRef}`,
      status: "PENDING",
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerification> {
    const payload = input.rawPayload as { amount?: string; currency?: string } | undefined;
    return {
      verified: true,
      providerRef: input.providerRef,
      amount: payload?.amount ?? "0.00",
      currency: payload?.currency ?? "ETB",
      status: "COMPLETED",
    };
  }

  async createWithdrawal(input: CreateWithdrawalInput): Promise<WithdrawalResponse> {
    return {
      providerRef: `mock_wd_${randomUUID()}`,
      status: "PROCESSING",
    };
  }

  async verifyWithdrawal(input: VerifyWithdrawalInput): Promise<WithdrawalVerification> {
    return {
      providerRef: input.providerRef,
      status: "COMPLETED",
    };
  }
}
