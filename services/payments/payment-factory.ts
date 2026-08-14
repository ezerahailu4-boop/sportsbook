import type { PaymentProvider } from "./payment-provider";
import { MockPaymentProvider } from "./mock-provider";
import { TelebirrProvider } from "./telebirr-provider";
import { ChapaProvider } from "./chapa-provider";

export type SupportedPaymentProvider = "mock" | "telebirr" | "chapa";

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const selected = (providerName || process.env.PAYMENT_PROVIDER || "mock").toLowerCase();

  switch (selected) {
    case "telebirr":
      return new TelebirrProvider();
    case "chapa":
      return new ChapaProvider();
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}
