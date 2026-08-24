import { NextResponse } from "next/server";
import { getAllowedCountries } from "@/services/jurisdiction/jurisdiction.service";

export async function GET() {
  const countries = getAllowedCountries();
  return NextResponse.json({
    success: true,
    data: { countries },
    error: null,
    meta: { total: countries.length },
  });
}
