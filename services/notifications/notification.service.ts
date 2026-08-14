import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "BET_PLACED"
  | "BET_WON"
  | "BET_LOST"
  | "BET_VOID"
  | "DEPOSIT_SUCCESS"
  | "DEPOSIT_FAILED"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_COMPLETED"
  | "WITHDRAWAL_FAILED"
  | "ODDS_CHANGED"
  | "SECURITY_ALERT";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}
