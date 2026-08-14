import { prisma } from "@/lib/prisma";

export interface KycProvider {
  submitVerification(input: { userId: string; documents: unknown }): Promise<{ providerRef: string }>;
  checkStatus(providerRef: string): Promise<"PENDING" | "VERIFIED" | "REJECTED">;
}

export class AutomatedKycProvider implements KycProvider {
  async submitVerification(input: { userId: string; documents: unknown }) {
    const providerRef = `kyc_${input.userId}_${Date.now()}`;
    return { providerRef };
  }
  async checkStatus(): Promise<"PENDING" | "VERIFIED" | "REJECTED"> {
    return "PENDING";
  }
}

function getProvider(): KycProvider {
  return new AutomatedKycProvider();
}

export async function submitKyc(userId: string, documents: unknown) {
  const provider = getProvider();
  const { providerRef } = await provider.submitVerification({ userId, documents });

  await prisma.user.update({ where: { id: userId }, data: { kycStatus: "PENDING" } });
  await prisma.auditLog.create({
    data: { actorId: userId, actorType: "user", action: "KYC_SUBMITTED", targetType: "User", targetId: userId, metadata: { providerRef } },
  });

  return { providerRef, status: "PENDING" as const };
}

export async function processKycWebhookResult(params: {
  userId: string;
  providerRef: string;
  status: "VERIFIED" | "REJECTED";
  reason?: string;
}) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: params.userId }, data: { kycStatus: params.status } }),
    prisma.auditLog.create({
      data: {
        actorId: "kyc_provider",
        actorType: "system",
        action: `KYC_${params.status}`,
        targetType: "User",
        targetId: params.userId,
        reason: params.reason || "Automated Identity & Liveness Check Complete",
        metadata: { providerRef: params.providerRef },
      },
    }),
  ]);

  return { success: true };
}

export async function manuallySetKycStatus(adminId: string, userId: string, status: "VERIFIED" | "REJECTED", reason: string) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { kycStatus: status } }),
    prisma.auditLog.create({
      data: { actorId: adminId, actorType: "admin", action: `KYC_${status}`, targetType: "User", targetId: userId, reason },
    }),
  ]);
}
