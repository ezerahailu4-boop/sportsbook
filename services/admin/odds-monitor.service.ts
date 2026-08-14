import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface OddsMonitorRow {
  eventId: string;
  eventLabel: string;
  sportKey: string;
  bookmakerKey: string;
  marketKey: string;
  outcomeName: string;
  currentPrice: string;
  previousPrice: string | null;
  direction: "UP" | "DOWN" | "UNCHANGED" | "NEW";
  lastUpdated: string;
}

export async function getOddsMonitor(sportKey?: string): Promise<OddsMonitorRow[]> {
  const markets = await prisma.market.findMany({
    where: sportKey ? { event: { sportKey } } : {},
    include: {
      event: true,
      outcomes: {
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
      },
    },
    take: 200,
    orderBy: { lastUpdated: "desc" },
  });

  const rows: OddsMonitorRow[] = [];

  for (const market of markets) {
    for (const outcome of market.outcomes) {
      const previous = outcome.snapshots[0];
      const currentPrice = outcome.price.toString();
      const previousPrice = previous ? previous.price.toString() : null;

      let direction: OddsMonitorRow["direction"] = "NEW";
      if (previousPrice) {
        if (Number(currentPrice) > Number(previousPrice)) direction = "UP";
        else if (Number(currentPrice) < Number(previousPrice)) direction = "DOWN";
        else direction = "UNCHANGED";
      }

      rows.push({
        eventId: market.event.id,
        eventLabel: `${market.event.homeTeam} vs ${market.event.awayTeam}`,
        sportKey: market.event.sportKey,
        bookmakerKey: market.bookmakerKey,
        marketKey: market.key,
        outcomeName: outcome.name,
        currentPrice,
        previousPrice,
        direction,
        lastUpdated: outcome.lastUpdated.toISOString(),
      });
    }
  }

  return rows;
}
