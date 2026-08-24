import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth-crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sportsbook database...");

  // 1. Create demo admin user
  const adminPasswordHash = await hashPassword("Admin1234!");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sportsbook.demo" },
    update: {},
    create: {
      email: "admin@sportsbook.demo",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "Operator",
      phone: "+251911000000",
      dateOfBirth: new Date("1985-05-15"),
      country: "ET",
      role: "ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
    },
  });

  // 2. Create demo standard user
  const userPasswordHash = await hashPassword("User1234!");
  const demoUser = await prisma.user.upsert({
    where: { email: "user@sportsbook.demo" },
    update: {},
    create: {
      email: "user@sportsbook.demo",
      passwordHash: userPasswordHash,
      firstName: "Abebe",
      lastName: "Bekele",
      phone: "+251922111222",
      dateOfBirth: new Date("1996-08-20"),
      country: "ET",
      role: "USER",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
    },
  });

  // 3. Create demo wallet for demo user
  const demoWallet = await prisma.wallet.upsert({
    where: {
      userId_mode_currency: {
        userId: demoUser.id,
        mode: "DEMO",
        currency: "ETB",
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      mode: "DEMO",
      currency: "ETB",
      availableBalance: 50.0,
      totalDeposited: 50.0,
    },
  });

  // Create initial wallet transaction for demo balance
  await prisma.walletTransaction.upsert({
    where: { reference: `demo_seed_deposit_${demoUser.id}` },
    update: {},
    create: {
      walletId: demoWallet.id,
      type: "DEPOSIT",
      amount: 5000.0,
      currency: "ETB",
      status: "COMPLETED",
      reference: `demo_seed_deposit_${demoUser.id}`,
      idempotencyKey: `seed_${demoUser.id}_deposit`,
      provider: "mock_telebirr",
      completedAt: new Date(),
      metadata: { note: "Initial demo seed funds" },
    },
  });

  // 4. Create sample promotions
  await prisma.promotion.createMany({
    data: [
      {
        name: "100% Welcome Match Bonus",
        description: "Double your first deposit up to 2,000 ETB in demo credits!",
        terms: "Minimum deposit 100 ETB. 5x wagering requirement on odds 1.50+ before withdrawal.",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: "ACTIVE",
      },
      {
        name: "Accumulator Boost up to 50%",
        description: "Place a multiple bet with 4+ selections and get up to 50% extra winnings!",
        terms: "Each selection must have minimum odds of 1.30. Valid on all football and basketball leagues.",
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        status: "ACTIVE",
      },
      {
        name: "Premier League Goalfest Cashback",
        description: "Get 10% refund on lost bets if a Premier League match ends 0-0.",
        terms: "Applicable on Pre-match 1X2 and Correct Score bets only.",
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        status: "ACTIVE",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding completed successfully.");
  console.log(`Admin credentials: admin@sportsbook.demo / Admin1234!`);
  console.log(`Demo user credentials: user@sportsbook.demo / User1234! (Balance: 5,000.00 ETB)`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
