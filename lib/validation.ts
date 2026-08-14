import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  dateOfBirth: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const ageDiff = Date.now() - d.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }, "You must be at least 18 years old to register"),
  country: z.string().default("ET"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms & conditions" }),
  }),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const BetSelectionInputSchema = z.object({
  eventId: z.string().min(1),
  marketKey: z.string().min(1),
  outcomeId: z.string().min(1),
  bookmakerKey: z.string().min(1),
  submittedPrice: z.string().or(z.number()),
  point: z.string().or(z.number()).optional(),
});

export const PlaceBetSchema = z.object({
  betType: z.enum(["SINGLE", "MULTIPLE"]),
  stake: z.string().or(z.number()).refine((v) => Number(v) > 0, "Stake must be greater than 0"),
  idempotencyKey: z.string().min(1),
  selections: z.array(BetSelectionInputSchema).min(1, "At least one selection is required"),
});

export const DepositSchema = z.object({
  amount: z.number().positive("Deposit amount must be greater than 0"),
  currency: z.string().default("ETB"),
  paymentMethod: z.string().default("mock_telebirr"),
  idempotencyKey: z.string().min(1),
});

export const WithdrawalSchema = z.object({
  amount: z.number().positive("Withdrawal amount must be greater than 0"),
  currency: z.string().default("ETB"),
  method: z.string().min(1, "Withdrawal method is required"),
  accountNumber: z.string().min(4, "Valid account or phone number is required"),
  idempotencyKey: z.string().min(1),
});

export const ResponsibleGamblingSchema = z.object({
  depositLimit: z.number().nullable().optional(),
  lossLimit: z.number().nullable().optional(),
  sessionLimitMins: z.number().int().positive().nullable().optional(),
  coolingOffDays: z.number().int().positive().nullable().optional(),
  selfExclusionMonths: z.number().int().positive().nullable().optional(),
});
