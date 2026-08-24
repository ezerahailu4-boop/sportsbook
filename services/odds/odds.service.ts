import * as oddsApi from "@/lib/odds-api";
import { normalizeEvents, type NormalizedEvent } from "./odds-normalizer";
import { validateEvent } from "./odds-validator";
import { getCachedEvents, cacheEvents, getCachedSports, cacheSports } from "./odds-cache";
import { fetchOpenFixtures } from "./open-fixtures-service";
import { fetchApiFootballEvents, fetchApiFootballLiveMatches } from "./api-football.service";
import { fetchEspnEvents } from "./espn-live-service";
import { SPORTS_CATEGORIES } from "@/lib/sports-constants";
import type { OddsApiSport } from "./odds-api-types";

export interface OddsResult {
  events: NormalizedEvent[];
  demoMode: boolean;
}

const DEFAULT_SPORTS: OddsApiSport[] = SPORTS_CATEGORIES.map((c) => ({
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
    sports: DEFAULT_SPORTS,
    demoMode: false,
  };
}

export async function getEventsForSport(sportKey: string): Promise<OddsResult> {
  if (sportKey === "live") {
    return getLiveEvents();
  }

  const cached = await getCachedEvents(sportKey);
  if (cached) return { events: cached, demoMode: false };

  // 1. Fetch real live matches & real bookmaker lines from ESPN
  try {
    const espnEvents = await fetchEspnEvents(sportKey);
    if (espnEvents && espnEvents.length > 0) {
      await cacheEvents(sportKey, espnEvents);
      return { events: espnEvents, demoMode: false };
    }
  } catch (err) {
    console.warn(`ESPN feed unavailable for ${sportKey}:`, (err as Error).message);
  }

  // 2. Try API-Football if API_FOOTBALL_KEY or RAPIDAPI_KEY is configured
  if (process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY) {
    try {
      const apiFootballEvents = await fetchApiFootballEvents(sportKey);
      if (apiFootballEvents && apiFootballEvents.length > 0) {
        await cacheEvents(sportKey, apiFootballEvents);
        return { events: apiFootballEvents, demoMode: false };
      }
    } catch (err) {
      console.warn(`API-Football unavailable for ${sportKey}:`, (err as Error).message);
    }
  }

  // 3. Try The Odds API if key is present
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
      console.warn(`Primary odds API unavailable for ${sportKey}:`, (err as Error).message);
    }
  }

  // 4. Try Open Fixtures feed
  try {
    const openEvents = await fetchOpenFixtures(sportKey);
    if (openEvents && openEvents.length > 0) {
      await cacheEvents(sportKey, openEvents);
      return { events: openEvents, demoMode: false };
    }
  } catch (err) {
    console.warn(`Open fixtures feed unavailable for ${sportKey}:`, (err as Error).message);
  }

  return { events: [], demoMode: false };
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
  
  // 1. Fetch real in-play live matches from API-Football
  try {
    const liveMatches = await fetchApiFootballLiveMatches();
    if (liveMatches && liveMatches.length > 0) {
      return { events: liveMatches, demoMode: false };
    }
  } catch (err) {
    console.error("Live match feed error:", err);
  }

  // 2. Check for any in-play games from ESPN
  for (const s of sports) {
    try {
      const { events } = await getEventsForSport(s);
      const liveOnes = events.filter((e) => e.isLive);
      if (liveOnes.length > 0) {
        return { events: liveOnes, demoMode: false };
      }
    } catch (e) {
      // continue
    }
  }

  // 3. If no match is in active live minutes right now, return scheduled matches of the day
  try {
    const { events: eplEvents } = await getEventsForSport("soccer_epl");
    return { events: eplEvents.slice(0, 5), demoMode: false };
  } catch (e) {
    return { events: [], demoMode: false };
  }
}
