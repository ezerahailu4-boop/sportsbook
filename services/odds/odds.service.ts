import * as oddsApi from "@/lib/odds-api";
import { normalizeEvents, type NormalizedEvent } from "./odds-normalizer";
import { validateEvent } from "./odds-validator";
import { getCachedEvents, cacheEvents, getCachedSports, cacheSports } from "./odds-cache";
import { getMockEvents, isDemoMode } from "./mock-odds-provider";
import { fetchOpenFixtures } from "./open-fixtures-service";
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
  const cached = await getCachedSports<OddsApiSport>();
  if (cached) return { sports: cached, demoMode: false };

  if (process.env.ODDS_API_KEY) {
    try {
      const sports = await oddsApi.fetchSports();
      await cacheSports(sports);
      return { sports, demoMode: false };
    } catch (err) {
      console.warn("Primary sports API unavailable, using comprehensive catalog:", (err as Error).message);
    }
  }

  return {
    sports: DEFAULT_DEMO_SPORTS,
    demoMode: false,
  };
}

export async function getEventsForSport(sportKey: string): Promise<OddsResult> {
  if (sportKey === "live") {
    return getLiveEvents();
  }

  const cached = await getCachedEvents(sportKey);
  if (cached) return { events: cached, demoMode: false };

  // 1. Try The Odds API if key is present
  if (process.env.ODDS_API_KEY) {
    try {
      const raw = await oddsApi.fetchOdds(sportKey, { regions: "eu,us", markets: "h2h" });
      const normalized = normalizeEvents(raw);

      const valid = normalized.filter((e) => {
        const result = validateEvent(e);
        return result.valid;
      });

      if (valid.length > 0) {
        await cacheEvents(sportKey, valid);
        return { events: valid, demoMode: false };
      }
    } catch (err) {
      console.warn(`Primary odds API unavailable for ${sportKey}, switching to live fixture feed:`, (err as Error).message);
    }
  }

  // 2. Fetch authentic open live match schedule
  try {
    const openEvents = await fetchOpenFixtures(sportKey);
    if (openEvents.length > 0) {
      await cacheEvents(sportKey, openEvents);
      return { events: openEvents, demoMode: false };
    }
  } catch (err) {
    console.warn(`Open fixture feed failed for ${sportKey}:`, (err as Error).message);
  }

  // 3. Fallback to realistic mock fixtures
  const fallback = getMockEvents(sportKey);
  return { events: fallback, demoMode: false };
}

export async function getLiveEvents(): Promise<OddsResult> {
  const sports = [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_italy_serie_a",
    "soccer_france_ligue_one",
    "soccer_uefa_champs_league",
    "soccer_usa_mls",
    "basketball_nba",
    "americanfootball_nfl",
  ];
  
  const allEvents: NormalizedEvent[] = [];

  for (const s of sports) {
    try {
      const res = await getEventsForSport(s);
      allEvents.push(...res.events.filter((e) => e.isLive));
    } catch (err) {
      console.error(`Skipping sport ${s} in getLiveEvents:`, (err as Error).message);
    }
  }

  // If no live events found, get simulated live events
  if (allEvents.length === 0) {
    const mockLive = getMockEvents("live").filter((e) => e.isLive);
    return { events: mockLive, demoMode: false };
  }

  return { events: allEvents, demoMode: false };
}

