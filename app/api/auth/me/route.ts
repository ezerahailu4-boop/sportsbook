import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-crypto";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await getSessionUser(token);

  if (!sessionUser) {
    return NextResponse.json({
      success: true,
      data: null,
      error: null,
      meta: { authenticated: false },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      kycStatus: true,
      country: true,
      wallets: {
        where: { mode: "DEMO", currency: "ETB" },
        select: {
          id: true,
          availableBalance: true,
          lockedBalance: true,
          totalDeposited: true,
          totalWithdrawn: true,
          totalWinnings: true,
          currency: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({
      success: true,
      data: null,
      error: null,
      meta: { authenticated: false },
    });
  }

  const demoWallet = user.wallets[0] ?? null;

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      country: user.country,
      wallet: demoWallet
        ? {
            id: demoWallet.id,
            availableBalance: demoWallet.availableBalance.toString(),
            lockedBalance: demoWallet.lockedBalance.toString(),
            totalDeposited: demoWallet.totalDeposited.toString(),
            totalWithdrawn: demoWallet.totalWithdrawn.toString(),
            totalWinnings: demoWallet.totalWinnings.toString(),
            currency: demoWallet.currency,
          }
        : null,
    },
    error: null,
    meta: { authenticated: true },
  });
}
