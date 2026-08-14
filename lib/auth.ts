import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, newSessionToken } from "@/lib/auth-crypto";
import { checkJurisdiction } from "@/services/jurisdiction/jurisdiction.service";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth: string; // ISO date
  country: string;
  termsAccepted: boolean;
}

export type RegisterResult =
  | { success: true; userId: string }
  | { success: false; error: { code: string; message: string } };

function isAdult(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return dob <= eighteenYearsAgo;
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  if (!input.termsAccepted) {
    return { success: false, error: { code: "TERMS_NOT_ACCEPTED", message: "You must accept the terms to register." } };
  }
  if (!isAdult(input.dateOfBirth)) {
    return { success: false, error: { code: "AGE_RESTRICTED", message: "You must be 18 or older to register." } };
  }
  const jurisdiction = checkJurisdiction(input.country);
  if (!jurisdiction.allowed) {
    return { success: false, error: { code: "JURISDICTION_RESTRICTED", message: jurisdiction.reason ?? "Registration is not available in your region." } };
  }
  if (input.password.length < 10) {
    return { success: false, error: { code: "WEAK_PASSWORD", message: "Password must be at least 10 characters." } };
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    return { success: false, error: { code: "EMAIL_TAKEN", message: "An account with this email already exists." } };
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      dateOfBirth: new Date(input.dateOfBirth),
      country: input.country,
      // kycStatus defaults to NOT_STARTED — registration alone never implies verification.
    },
  });

  // Every new user gets a DEMO wallet automatically so the bet-slip flow
  // works immediately. A REAL wallet is never created here.
  await prisma.wallet.create({
    data: { userId: user.id, mode: "DEMO", currency: "ETB", availableBalance: 10000 },
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, actorType: "user", action: "USER_REGISTERED", targetType: "User", targetId: user.id },
  });

  return { success: true, userId: user.id };
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export type LoginResult =
  | { success: true; token: string; userId: string }
  | { success: false; error: { code: string; message: string } };

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  // Deliberately identical error for "no such user" and "wrong password" —
  // don't leak which emails are registered.
  const invalidCreds = { success: false as const, error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." } };

  if (!user) return invalidCreds;

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) return invalidCreds;

  if (user.status !== "ACTIVE") {
    return { success: false, error: { code: "ACCOUNT_RESTRICTED", message: "This account cannot log in right now." } };
  }

  const token = newSessionToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  return { success: true, token, userId: user.id };
}

export async function logout(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  status: string;
}

// The one function every protected API route should call to resolve the
// session cookie into a trusted userId. Nothing upstream of this (request
// body, query params) is ever trusted as identity.
export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.status !== "ACTIVE") return null;

  return { id: session.user.id, email: session.user.email, role: session.user.role, status: session.user.status };
}
