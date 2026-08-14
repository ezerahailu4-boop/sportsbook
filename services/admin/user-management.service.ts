import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function searchUsers(query: string, statusFilter?: string) {
  return prisma.user.findMany({
    where: {
      AND: [
        query
          ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }] }
          : {},
        statusFilter ? { status: statusFilter as any } : {},
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      kycStatus: true,
      createdAt: true,
      wallets: { select: { availableBalance: true, currency: true, mode: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });
}

export interface SuspendUserInput {
  adminId: string;
  userId: string;
  reason: string;
}

export async function suspendUser(input: SuspendUserInput) {
  if (!input.reason?.trim()) {
    return { success: false as const, error: { code: "REASON_REQUIRED", message: "A reason is required to suspend an account." } };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: input.userId }, data: { status: "SUSPENDED" } }),
    prisma.auditLog.create({
      data: {
        actorId: input.adminId,
        actorType: "admin",
        action: "USER_SUSPENDED",
        targetType: "User",
        targetId: input.userId,
        reason: input.reason,
      },
    }),
  ]);

  return { success: true as const };
}

export async function reinstateUser(adminId: string, userId: string, reason: string) {
  if (!reason?.trim()) {
    return { success: false as const, error: { code: "REASON_REQUIRED", message: "A reason is required to reinstate an account." } };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } }),
    prisma.auditLog.create({
      data: { actorId: adminId, actorType: "admin", action: "USER_REINSTATED", targetType: "User", targetId: userId, reason },
    }),
  ]);
  return { success: true as const };
}

export interface AdjustBalanceInput {
  adminId: string;
  userId: string;
  amount: string; // signed decimal string; negative = debit
  reason: string;
}

// Spec section 44: any balance adjustment requires reason + admin identity +
// timestamp + audit log. This is the only path an admin has to touch a
// wallet directly — never expose a raw "set balance" endpoint.
export async function adjustBalance(input: AdjustBalanceInput) {
  if (!input.reason?.trim()) {
    return { success: false as const, error: { code: "REASON_REQUIRED", message: "A reason is required for balance adjustments." } };
  }

  const amount = new Prisma.Decimal(input.amount);

  try {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst({ where: { userId: input.userId, mode: "DEMO" } });
      if (!wallet) throw new Error("WALLET_NOT_FOUND");

      const newBalance = new Prisma.Decimal(wallet.availableBalance.toString()).plus(amount);
      if (newBalance.lessThan(0)) throw new Error("WOULD_GO_NEGATIVE");

      await tx.wallet.update({ where: { id: wallet.id }, data: { availableBalance: { increment: amount } } });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "ADJUSTMENT",
          amount,
          currency: wallet.currency,
          status: "COMPLETED",
          reference: `admin_adj_${Date.now()}`,
          idempotencyKey: `admin_adj_${input.adminId}_${input.userId}_${Date.now()}`,
          completedAt: new Date(),
          metadata: { adminId: input.adminId, reason: input.reason },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: input.adminId,
          actorType: "admin",
          action: "BALANCE_ADJUSTED",
          targetType: "Wallet",
          targetId: wallet.id,
          reason: input.reason,
          metadata: { amount: amount.toString(), affectedUserId: input.userId },
        },
      });
    });

    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message === "WALLET_NOT_FOUND") return { success: false as const, error: { code: "WALLET_NOT_FOUND", message: "No wallet found." } };
    if (message === "WOULD_GO_NEGATIVE") return { success: false as const, error: { code: "INVALID_ADJUSTMENT", message: "Adjustment would make balance negative." } };
    return { success: false as const, error: { code: "ADJUSTMENT_FAILED", message: "Failed to adjust balance." } };
  }
}
