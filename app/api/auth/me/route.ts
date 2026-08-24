import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-crypto";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { localDb } from "@/lib/local-store";

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

  let user = null;
  try {
    user = await prisma.user.findUnique({
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
        emailVerifiedAt: true,
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
  } catch (err) {
    console.warn("Prisma unavailable in /api/auth/me, reading from localStore:", (err as Error).message);
  }

  if (!user) {
    const localUser = localDb.getUserById(sessionUser.id);
    if (!localUser) {
      return NextResponse.json({
        success: true,
        data: null,
        error: null,
        meta: { authenticated: false },
      });
    }

    const localWallet = localDb.getWallet(localUser.id);

    return NextResponse.json({
      success: true,
      data: {
        id: localUser.id,
        email: localUser.email,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
        phone: localUser.phone,
        role: localUser.role,
        status: localUser.status,
        kycStatus: localUser.kycStatus,
        country: localUser.country,
        emailVerified: !!localUser.emailVerifiedAt,
        wallet: localWallet
          ? {
              id: localWallet.id,
              availableBalance: localWallet.availableBalance.toString(),
              lockedBalance: "0.00",
              totalDeposited: localWallet.totalDeposited.toString(),
              totalWithdrawn: localWallet.totalWithdrawn.toString(),
              totalWinnings: "0.00",
              currency: localWallet.currency,
            }
          : null,
      },
      error: null,
      meta: { authenticated: true },
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
      emailVerified: !!user.emailVerifiedAt,
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
