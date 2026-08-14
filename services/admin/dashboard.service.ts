import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DashboardMetrics {
  registeredUsers: number;
  activeUsers: number;
  totalBets: number;
  openBets: number;
  completedBets: number;
  totalStakes: string;
  totalDeposits: string;
  totalWithdrawals: string;
  pendingPayments: number;
  failedPayments: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [registeredUsers, activeUsers, totalBets, openBets, completedBets, stakeAgg, depositAgg, withdrawalAgg, pendingPayments, failedPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.bet.count(),
      prisma.bet.count({ where: { status: "PENDING" } }),
      prisma.bet.count({ where: { status: { in: ["WON", "LOST", "VOID"] } } }),
      prisma.bet.aggregate({ _sum: { stake: true } }),
      prisma.paymentTransaction.aggregate({ where: { type: "deposit", status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.withdrawal.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.paymentTransaction.count({ where: { status: "PENDING" } }),
      prisma.paymentTransaction.count({ where: { status: "FAILED" } }),
    ]);

  return {
    registeredUsers,
    activeUsers,
    totalBets,
    openBets,
    completedBets,
    totalStakes: (stakeAgg._sum.stake ?? 0).toString(),
    totalDeposits: (depositAgg._sum.amount ?? 0).toString(),
    totalWithdrawals: (withdrawalAgg._sum.amount ?? 0).toString(),
    pendingPayments,
    failedPayments,
  };
}
