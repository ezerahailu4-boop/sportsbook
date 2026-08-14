import type { OddsApiEvent } from "./odds-api-types";

export interface NormalizedOutcome {
  externalId: string; // synthetic: `${marketKey}:${bookmakerKey}:${outcomeName}:${point ?? ""}`
  name: string;
  price: string; // decimal string, converted immediately from the API's number
  point: string | null;
  marketKey: string;
  bookmakerKey: string;
  eventExternalId: string;
  lastUpdated: string;
}

export interface NormalizedMarket {
  key: string;
  name: string;
  bookmakerKey: string;
  eventExternalId: string;
  lastUpdated: string;
  outcomes: NormalizedOutcome[];
}

export interface NormalizedBookmaker {
  key: string;
  name: string;
  region: string | null;
  lastUpdated: string;
}

export interface NormalizedEvent {
  externalId: string;
  sportKey: string;
  sportTitle: string;
  league: string | null;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  isLive: boolean;
  liveMinute?: string;
  score?: string;
  lastUpdated: string;
  bookmakers: NormalizedBookmaker[];
  markets: NormalizedMarket[];
}

const MARKET_DISPLAY_NAMES: Record<string, string> = {
  h2h: "Moneyline",
  h2h_3_way: "1X2",
  spreads: "Handicap",
  alternate_spreads: "Alternate Handicap",
  totals: "Over/Under",
  alternate_totals: "Alternate Over/Under",
  team_totals: "Team Totals",
  btts: "Both Teams To Score",
  draw_no_bet: "Draw No Bet",
};

function isEventLive(commenceTime: string): boolean {
  return new Date(commenceTime).getTime() <= Date.now();
}

// Converts one raw The Odds API event into our internal normalized shape.
// Keeps external IDs on every level, per spec section 6 — required for
// bet-placement validation against the live API later.
export function normalizeEvent(raw: OddsApiEvent): NormalizedEvent {
  const now = new Date().toISOString();
  const bookmakersSeen = new Map<string, NormalizedBookmaker>();
  const markets: NormalizedMarket[] = [];

  for (const bm of raw.bookmakers) {
    if (!bookmakersSeen.has(bm.key)) {
      bookmakersSeen.set(bm.key, {
        key: bm.key,
        name: bm.title,
        region: null,
        lastUpdated: bm.last_update,
      });
    }

    for (const market of bm.markets) {
      const outcomes: NormalizedOutcome[] = market.outcomes.map((o) => ({
        externalId: `${market.key}:${bm.key}:${o.name}:${o.point ?? ""}`,
        name: o.name,
        price: o.price.toString(),
        point: o.point != null ? o.point.toString() : null,
        marketKey: market.key,
        bookmakerKey: bm.key,
        eventExternalId: raw.id,
        lastUpdated: market.last_update,
      }));

      markets.push({
        key: market.key,
        name: MARKET_DISPLAY_NAMES[market.key] ?? market.key,
        bookmakerKey: bm.key,
        eventExternalId: raw.id,
        lastUpdated: market.last_update,
        outcomes,
      });
    }
  }

  return {
    externalId: raw.id,
    sportKey: raw.sport_key,
    sportTitle: raw.sport_title,
    league: raw.sport_title,
    homeTeam: raw.home_team,
    awayTeam: raw.away_team,
    commenceTime: raw.commence_time,
    isLive: isEventLive(raw.commence_time),
    lastUpdated: now,
    bookmakers: Array.from(bookmakersSeen.values()),
    markets,
  };
}

export function normalizeEvents(raw: OddsApiEvent[]): NormalizedEvent[] {
  return raw.map(normalizeEvent);
}
