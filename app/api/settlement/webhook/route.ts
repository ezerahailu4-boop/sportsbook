import { NextResponse } from "next/server";
import { settleMatchMarket } from "@/services/settlement/settlement.service";
import crypto from "crypto";

// Authorized B2B sports settlement ingestion webhook
// Accepts official results from Sportradar / Betradar / Custom feed
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const signature = req.headers.get("x-settlement-signature");
  const expectedSecret = process.env.SETTLEMENT_WEBHOOK_SECRET;

  // Verify secret token or HMAC signature if configured
  if (expectedSecret) {
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, "");
    if (bearerToken !== expectedSecret && signature) {
      const rawBody = await req.clone().text();
      const expectedSign = crypto.createHmac("sha256", expectedSecret).update(rawBody).digest("hex");
      if (signature !== expectedSign) {
        return NextResponse.json(
          { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Invalid webhook signature." }, meta: {} },
          { status: 401 }
        );
      }
    } else if (bearerToken !== expectedSecret && !signature) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Invalid authorization token." }, meta: {} },
        { status: 401 }
      );
    }
  }

  try {
    const body = await req.json();
    const { eventId, homeScore, awayScore, status, marketSettlements } = body;

    if (!eventId || status !== "FINISHED") {
      return NextResponse.json(
        { success: true, data: { status: "IGNORED", reason: "Event not finished yet" }, error: null, meta: {} }
      );
    }

    const reports = [];

    // If direct marketSettlements are provided, process them
    if (Array.isArray(marketSettlements)) {
      for (const item of marketSettlements) {
        const report = await settleMatchMarket({
          eventId,
          marketKey: item.marketKey,
          outcomeResults: item.outcomeResults,
          reason: item.reason || `Official Feed Settlement: ${homeScore}-${awayScore}`,
        });
        reports.push(report);
      }
    } else if (typeof homeScore === "number" && typeof awayScore === "number") {
      // Auto-compute standard markets from official scores
      const homeWin = homeScore > awayScore;
      const awayWin = awayScore > homeScore;
      const draw = homeScore === awayScore;

      // 1. Moneyline / 1X2 Market
      const h2hReport = await settleMatchMarket({
        eventId,
        marketKey: "h2h",
        outcomeResults: [
          { outcomeId: "home", status: homeWin ? "WON" : "LOST" },
          { outcomeId: "away", status: awayWin ? "WON" : "LOST" },
          { outcomeId: "draw", status: draw ? "WON" : "LOST" },
        ],
        reason: `Official Full Time Score: ${homeScore} - ${awayScore}`,
      });
      reports.push(h2hReport);

      // 2. Both Teams To Score (BTTS)
      const bttsYes = homeScore > 0 && awayScore > 0;
      const bttsReport = await settleMatchMarket({
        eventId,
        marketKey: "btts",
        outcomeResults: [
          { outcomeId: "yes", status: bttsYes ? "WON" : "LOST" },
          { outcomeId: "no", status: !bttsYes ? "WON" : "LOST" },
        ],
        reason: `BTTS Evaluation: ${homeScore} - ${awayScore}`,
      });
      reports.push(bttsReport);
    }

    return NextResponse.json({
      success: true,
      data: { eventId, settledMarkets: reports.length, reports },
      error: null,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error("Settlement webhook ingestion failed:", err);
    return NextResponse.json(
      { success: false, data: null, error: { code: "INGESTION_ERROR", message: "Failed to process settlement." }, meta: {} },
      { status: 500 }
    );
  }
}
