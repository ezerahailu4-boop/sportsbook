import { NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await register({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    password: body.password,
    dateOfBirth: body.dateOfBirth,
    country: body.country,
    termsAccepted: body.termsAccepted === true,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, data: null, error: result.error, meta: {} }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { userId: result.userId }, error: null, meta: {} });
}
