import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface RGCheckResult {
  allowed: boolean;
  reason?: string;
}

// Called from bet-validation.service.ts before a bet is allowed. Spec
// section 39: "Backend must enforce these controls" — a limit that only
// exists in the UI is not a control.
export async function checkCanBet(userId: string, stake: string): Promise<RGCheckResult> {
  const settings = await prisma.responsibleGamblingSetting.findUnique({ where: { userId } });
  if (!settings) return { allowed: true };

  if (settings.selfExclusionUntil && settings.selfExclusionUntil > new Date()) {
    return { allowed: false, reason: "Self-exclusion is currently active on your account." };
  }
  if (settings.coolingOffUntil && settings.coolingOffUntil > new Date()) {
    return { allowed: false, reason: "Your account is in a cooling-off period." };
  }

  if (settings.lossLimit) {
    const since = new Date();
    since.setHours(0, 0, 0, 0); // daily window — extend to weekly/monthly as separate configured limits if needed

    const losses = await prisma.bet.aggregate({
      where: { userId, status: "LOST", settledAt: { gte: since } },
      _sum: { stake: true },
    });
    const lostToday = new Prisma.Decimal(losses._sum.stake ?? 0);
    if (lostToday.greaterThanOrEqualTo(new Prisma.Decimal(settings.lossLimit.toString()))) {
      return { allowed: false, reason: "You've reached your daily loss limit." };
    }
  }

  return { allowed: true };
}

export interface UpdateRGSettingsInput {
  userId: string;
  depositLimit?: string;
  lossLimit?: string;
  sessionLimitMins?: number;
}

// Limits can only be tightened immediately; loosening a limit takes effect
// after a cooling-off delay in a real implementation (industry-standard
// anti-chasing-losses practice). Not yet enforced here — see TODO.
export async function updateLimits(input: UpdateRGSettingsInput) {
  // TODO: before allowing a limit increase, require a 24h+ delay per
  // industry practice. Currently applies immediately — fine for demo mode,
  // not for production.
  return prisma.responsibleGamblingSetting.upsert({
    where: { userId: input.userId },
    update: {
      depositLimit: input.depositLimit ? new Prisma.Decimal(input.depositLimit) : undefined,
      lossLimit: input.lossLimit ? new Prisma.Decimal(input.lossLimit) : undefined,
      sessionLimitMins: input.sessionLimitMins,
    },
    create: {
      userId: input.userId,
      depositLimit: input.depositLimit ? new Prisma.Decimal(input.depositLimit) : null,
      lossLimit: input.lossLimit ? new Prisma.Decimal(input.lossLimit) : null,
      sessionLimitMins: input.sessionLimitMins,
    },
  });
}

export async function selfExclude(userId: string, days: number) {
  const until = new Date();
  until.setDate(until.getDate() + days);

  await prisma.$transaction([
    prisma.responsibleGamblingSetting.upsert({
      where: { userId },
      update: { selfExclusionUntil: until },
      create: { userId, selfExclusionUntil: until },
    }),
    prisma.auditLog.create({
      data: { actorId: userId, actorType: "user", action: "SELF_EXCLUDED", targetType: "User", targetId: userId, metadata: { days } },
    }),
  ]);

  return { until };
}

export async function startCoolingOff(userId: string, hours: number) {
  const until = new Date();
  until.setHours(until.getHours() + hours);

  await prisma.responsibleGamblingSetting.upsert({
    where: { userId },
    update: { coolingOffUntil: until },
    create: { userId, coolingOffUntil: until },
  });

  return { until };
}
