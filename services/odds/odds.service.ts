// The single entry point the rest of the app (API routes, sync jobs) should
// use for odds data. Never call lib/odds-api.ts or the mock provider
// directly from a route handler — go through here so caching, validation,
// and demo-mode fallback are applied consistently.
import * as oddsApi from "@/lib/odds-api";
import { normalizeEvents, type NormalizedEvent } from "./odds-normalizer";
import { validateEvent } from "./odds-validator";
import { getCachedEvents, cacheEvents, getCachedSports, cacheSports } from "./odds-cache";
import { getMockEvents, isDemoMode } from "./mock-odds-provider";
import type { OddsApiSport } from "./odds-api-types";

export interface OddsResult {
  events: NormalizedEvent[];
  demoMode: boolean;
}

export async function getSports(): Promise<{ sports: OddsApiSport[]; demoMode: boolean }> {
  if (isDemoMode()) {
    return {
      sports: [
        { key: "soccer_epl", group: "Soccer", title: "EPL", description: "English Premier League", active: true, has_outrights: false },
        { key: "basketball_nba", group: "Basketball", title: "NBA", description: "US Basketball", active: true, has_outrights: false },
        { key: "tennis_atp", group: "Tennis", title: "ATP", description: "Men's Tennis", active: true, has_outrights: false },
      ],
      demoMode: true,
    };
  }

  const cached = await getCachedSports<OddsApiSport>();
  if (cached) return { sports: cached, demoMode: false };

  const sports = await oddsApi.fetchSports();
  await cacheSports(sports);
  return { sports, demoMode: false };
}

export async function getEventsForSport(sportKey: string): Promise<OddsResult> {
  if (isDemoMode()) {
    return { events: getMockEvents(sportKey), demoMode: true };
  }

  const cached = await getCachedEvents(sportKey);
  if (cached) return { events: cached, demoMode: false };

  const raw = await oddsApi.fetchOdds(sportKey, { regions: "eu,uk,us", markets: "h2h,spreads,totals" });
  const normalized = normalizeEvents(raw);

  const valid = normalized.filter((e) => {
    const result = validateEvent(e);
    if (!result.valid) {
      console.error(`Dropping malformed event ${e.externalId}:`, result.errors);
    }
    return result.valid;
  });

  await cacheEvents(sportKey, valid);
  return { events: valid, demoMode: false };
}

export async function getLiveEvents(): Promise<OddsResult> {
  if (isDemoMode()) {
    return { events: getMockEvents("live"), demoMode: true };
  }

  const sports = ["soccer_epl", "soccer_spain_la_liga", "basketball_nba", "tennis_atp"];
  const allEvents: NormalizedEvent[] = [];

  for (const s of sports) {
    const res = await getEventsForSport(s);
    allEvents.push(...res.events.filter((e) => e.isLive));
  }

  return { events: allEvents, demoMode: false };
}
