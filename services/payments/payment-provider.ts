export interface CreateDepositInput {
  userId: string;
  amount: string; // decimal string, never a float
  currency: string;
  idempotencyKey: string;
}

export interface PaymentResponse {
  providerRef: string;
  checkoutUrl?: string;
  status: "PENDING" | "PROCESSING";
}

export interface VerifyPaymentInput {
  providerRef: string;
  signature?: string;
  rawPayload: unknown;
}

export interface PaymentVerification {
  verified: boolean;
  providerRef: string;
  amount: string;
  currency: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
}

export interface CreateWithdrawalInput {
  userId: string;
  amount: string;
  currency: string;
  destination: string;
  idempotencyKey: string;
}

export interface WithdrawalResponse {
  providerRef: string;
  status: "PENDING" | "PROCESSING";
}

export interface VerifyWithdrawalInput {
  providerRef: string;
}

export interface WithdrawalVerification {
  providerRef: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
  failureReason?: string;
}

// The wallet/deposit/withdrawal services depend only on this interface.
// Swapping PAYMENT_PROVIDER in .env should never require changes to
// services/wallet/* — only a new adapter implementing this contract.
export interface PaymentProvider {
  createDeposit(input: CreateDepositInput): Promise<PaymentResponse>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerification>;
  createWithdrawal(input: CreateWithdrawalInput): Promise<WithdrawalResponse>;
  verifyWithdrawal(input: VerifyWithdrawalInput): Promise<WithdrawalVerification>;
}
