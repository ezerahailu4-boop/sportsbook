// Intended to run on a schedule (cron / queue worker), not inside a request
// handler. Pulls configured sports, fetches events+odds, normalizes them,
// and upserts into Postgres — detecting price changes and expired events
// along the way (spec section 7, steps 1-11).
import { prisma } from "@/lib/prisma";
import { getEventsForSport, getSports } from "./odds.service";
import type { NormalizedEvent } from "./odds-normalizer";

// Sports actively tracked by the sync job. In production this should come
// from an admin-configurable table rather than a hardcoded list.
const CONFIGURED_SPORT_KEYS = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_germany_bundesliga",
  "basketball_nba",
  "tennis_atp",
  "americanfootball_nfl",
  "baseball_mlb",
  "icehockey_nhl",
];

export interface SyncSummary {
  sportKey: string;
  eventsProcessed: number;
  priceChangesDetected: number;
  demoMode: boolean;
}

async function upsertEvent(normalized: NormalizedEvent): Promise<{ priceChanges: number }> {
  let priceChanges = 0;

  const sport = await prisma.sport.upsert({
    where: { key: normalized.sportKey },
    update: { title: normalized.sportTitle },
    create: { key: normalized.sportKey, title: normalized.sportTitle, group: normalized.sportTitle },
  });

  const event = await prisma.event.upsert({
    where: { externalId: normalized.externalId },
    update: {
      homeTeam: normalized.homeTeam,
      awayTeam: normalized.awayTeam,
      commenceTime: new Date(normalized.commenceTime),
      isLive: normalized.isLive,
      lastUpdated: new Date(),
    },
    create: {
      externalId: normalized.externalId,
      sportId: sport.id,
      sportKey: normalized.sportKey,
      sportTitle: normalized.sportTitle,
      league: normalized.league,
      homeTeam: normalized.homeTeam,
      awayTeam: normalized.awayTeam,
      commenceTime: new Date(normalized.commenceTime),
      isLive: normalized.isLive,
    },
  });

  for (const bm of normalized.bookmakers) {
    const bookmaker = await prisma.bookmaker.upsert({
      where: { key: bm.key },
      update: { name: bm.name, lastUpdated: new Date(bm.lastUpdated) },
      create: { key: bm.key, name: bm.name, region: bm.region, lastUpdated: new Date(bm.lastUpdated) },
    });

    const marketsForBookmaker = normalized.markets.filter((m) => m.bookmakerKey === bm.key);

    for (const m of marketsForBookmaker) {
      const market = await prisma.market.upsert({
        where: { eventId_bookmakerId_key: { eventId: event.id, bookmakerId: bookmaker.id, key: m.key } },
        update: { lastUpdated: new Date(m.lastUpdated) },
        create: {
          key: m.key,
          name: m.name,
          eventId: event.id,
          bookmakerId: bookmaker.id,
          bookmakerKey: bm.key,
          lastUpdated: new Date(m.lastUpdated),
        },
      });

      for (const o of m.outcomes) {
        const existing = await prisma.outcome.findFirst({
          where: { marketId: market.id, name: o.name, point: o.point ? Number(o.point) : null },
        });

        if (existing) {
          if (existing.price.toString() !== o.price) {
            priceChanges++;
            // Snapshot the old price before overwriting, so admin odds
            // monitoring (spec section 45) can show previous vs current.
            await prisma.oddsSnapshot.create({
              data: { outcomeId: existing.id, price: existing.price, point: existing.point },
            });
          }
          await prisma.outcome.update({
            where: { id: existing.id },
            data: { price: o.price, point: o.point ? Number(o.point) : null, lastUpdated: new Date(o.lastUpdated) },
          });
        } else {
          await prisma.outcome.create({
            data: {
              marketId: market.id,
              name: o.name,
              price: o.price,
              point: o.point ? Number(o.point) : null,
              lastUpdated: new Date(o.lastUpdated),
            },
          });
        }
      }
    }
  }

  return { priceChanges };
}

export async function syncSport(sportKey: string): Promise<SyncSummary> {
  const { events, demoMode } = await getEventsForSport(sportKey);

  let priceChangesDetected = 0;
  for (const event of events) {
    const { priceChanges } = await upsertEvent(event);
    priceChangesDetected += priceChanges;
  }

  // Mark events that have started as no longer upcoming.
  await prisma.event.updateMany({
    where: { sportKey, commenceTime: { lt: new Date() }, status: "UPCOMING" },
    data: { status: "LIVE" },
  });

  return { sportKey, eventsProcessed: events.length, priceChangesDetected, demoMode };
}

export async function syncAllConfiguredSports(): Promise<SyncSummary[]> {
  await getSports(); // warms the sports cache
  const results: SyncSummary[] = [];
  for (const sportKey of CONFIGURED_SPORT_KEYS) {
    try {
      results.push(await syncSport(sportKey));
    } catch (err) {
      console.error(`Odds sync failed for ${sportKey}:`, err);
    }
  }
  return results;
}
