import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-store";
import { hashPassword } from "@/lib/auth-crypto";

export async function GET() {
  const users = localDb.getAllUsersWithWallets();
  return NextResponse.json({
    success: true,
    data: { users },
    error: null,
    meta: {},
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, firstName, lastName, phone, initialBalance, role } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "VALIDATION_ERROR", message: "Email and password are required." }, meta: {} },
      { status: 400 }
    );
  }

  const existing = localDb.getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "EMAIL_TAKEN", message: "Account with this email already exists." }, meta: {} },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const createdUser = localDb.createUser(
    {
      id: newUserId,
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || "Player",
      lastName: lastName || "Account",
      phone: phone || undefined,
      dateOfBirth: "1998-01-01T00:00:00.000Z",
      country: "ET",
      role: role === "ADMIN" ? "ADMIN" : "USER",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      createdAt: new Date().toISOString(),
    },
    Number(initialBalance) || 50
  );

  return NextResponse.json({
    success: true,
    data: { user: createdUser, message: "User account created successfully." },
    error: null,
    meta: {},
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { action, userId } = body;

  if (action === "ADJUST_BALANCE") {
    const { deltaAmount, reason } = body;
    const res = localDb.adjustUserBalance(userId, Number(deltaAmount), reason || "Admin manual adjustment");
    if (!res.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "User or wallet not found." }, meta: {} },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { newBalance: res.newBalance, message: `Balance updated. New Balance: ${res.newBalance} ETB` },
      error: null,
      meta: {},
    });
  } else if (action === "UPDATE_STATUS") {
    const { status, kycStatus, role } = body;
    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (kycStatus) updates.kycStatus = kycStatus;
    if (role) updates.role = role;

    const user = localDb.updateUser(userId, updates);
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "User not found." }, meta: {} },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { user, message: "User status updated successfully." },
      error: null,
      meta: {},
    });
  }

  return NextResponse.json(
    { success: false, data: null, error: { code: "INVALID_ACTION", message: "Invalid action." }, meta: {} },
    { status: 400 }
  );
}
