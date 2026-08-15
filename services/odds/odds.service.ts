// The single entry point the rest of the app (API routes, sync jobs) should
// use for odds data. Never call lib/odds-api.ts or the mock provider
// directly from a route handler — go through here so caching, validation,
// and demo-mode fallback are applied consistently. 
import * as oddsApi from "@/lib/odds-api";
import { normalizeEvents, type NormalizedEvent } from "./odds-normalizer";
import { validateEvent } from "./odds-validator";
import { getCachedEvents, cacheEvents, getCachedSports, cacheSports } from "./odds-cache";
import { getMockEvents, isDemoMode } from "./mock-odds-provider";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";
import type { OddsApiSport } from "./odds-api-types";

export interface OddsResult {
  events: NormalizedEvent[];
  demoMode: boolean;
}

const DEFAULT_DEMO_SPORTS: OddsApiSport[] = SPORTS_CATEGORIES.map((c) => ({
  key: c.key,
  group: c.sportGroup,
  title: c.name,
  description: `${c.name} (${c.country})`,
  active: true,
  has_outrights: false,
}));

export async function getSports(): Promise<{ sports: OddsApiSport[]; demoMode: boolean }> {
  if (isDemoMode()) {
    return {
      sports: DEFAULT_DEMO_SPORTS,
      demoMode: true,
    };
  }

  const cached = await getCachedSports<OddsApiSport>();
  if (cached) return { sports: cached, demoMode: false };

  try {
    const sports = await oddsApi.fetchSports();
    await cacheSports(sports);
    return { sports, demoMode: false };
  } catch (err) {
    console.error("Failed to fetch sports from API, falling back to demo sports:", (err as Error).message);
    return {
      sports: DEFAULT_DEMO_SPORTS,
      demoMode: true,
    };
  }
}

export async function getEventsForSport(sportKey: string): Promise<OddsResult> {
  if (sportKey === "live") {
    return getLiveEvents();
  }

  if (isDemoMode()) {
    return { events: getMockEvents(sportKey), demoMode: true };
  }

  const cached = await getCachedEvents(sportKey);
  if (cached) return { events: cached, demoMode: false };

  try {
    const raw = await oddsApi.fetchOdds(sportKey, { regions: "eu,us", markets: "h2h" });
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
  } catch (err) {
    console.error(`Failed to fetch odds for ${sportKey} from API, falling back to mock provider:`, (err as Error).message);
    return { events: getMockEvents(sportKey), demoMode: true };
  }
}

export async function getLiveEvents(): Promise<OddsResult> {
  if (isDemoMode()) {
    return { events: getMockEvents("live"), demoMode: true };
  }

  const sports = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_usa_mls",
    "basketball_nba",
    "tennis_atp",
    "baseball_mlb",
    "icehockey_nhl",
    "cricket_ipl",
  ];
  
  const allEvents: NormalizedEvent[] = [];
  let anyDemo = false;

  for (const s of sports) {
    try {
      const res = await getEventsForSport(s);
      allEvents.push(...res.events.filter((e) => e.isLive));
      if (res.demoMode) anyDemo = true;
    } catch (err) {
      console.error(`Skipping sport ${s} in getLiveEvents:`, (err as Error).message);
    }
  }

  return { events: allEvents, demoMode: anyDemo };
}
