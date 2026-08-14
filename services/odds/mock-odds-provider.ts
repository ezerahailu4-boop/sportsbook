import type { NormalizedEvent } from "./odds-normalizer";

export interface MockMatchDef {
  sportKey: string;
  sportTitle: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  isLive: boolean;
  liveMinute?: string;
  score?: string;
  hoursFromNow: number;
  h2h: [string, string, string?]; // home, away, draw (optional for non-draw sports)
  totals?: { line: number; over: string; under: string };
  spreads?: { homePoint: number; homePrice: string; awayPrice: string };
  btts?: { yes: string; no: string };
}

const DEMO_MATCH_DEFINITIONS: MockMatchDef[] = [
  {
    sportKey: "soccer_epl",
    sportTitle: "English Premier League",
    league: "Premier League",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    isLive: true,
    liveMinute: "64'",
    score: "2 - 1",
    hoursFromNow: 0,
    h2h: ["1.62", "4.80", "3.90"],
    totals: { line: 3.5, over: "1.92", under: "1.88" },
    spreads: { homePoint: -1.5, homePrice: "2.10", awayPrice: "1.75" },
    btts: { yes: "1.55", no: "2.35" },
  },
  {
    sportKey: "soccer_epl",
    sportTitle: "English Premier League",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    isLive: false,
    hoursFromNow: 3,
    h2h: ["1.85", "3.80", "3.60"],
    totals: { line: 2.5, over: "1.78", under: "2.05" },
    spreads: { homePoint: -0.5, homePrice: "1.85", awayPrice: "1.95" },
    btts: { yes: "1.68", no: "2.15" },
  },
  {
    sportKey: "soccer_spain_la_liga",
    sportTitle: "Spanish La Liga",
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    isLive: true,
    liveMinute: "38'",
    score: "1 - 1",
    hoursFromNow: 0,
    h2h: ["2.10", "3.20", "3.40"],
    totals: { line: 2.5, over: "1.65", under: "2.20" },
    spreads: { homePoint: 0.0, homePrice: "1.60", awayPrice: "2.30" },
    btts: { yes: "1.50", no: "2.50" },
  },
  {
    sportKey: "soccer_uefa_champs_league",
    sportTitle: "UEFA Champions League",
    league: "Champions League",
    homeTeam: "Bayern Munich",
    awayTeam: "Paris Saint-Germain",
    isLive: false,
    hoursFromNow: 26,
    h2h: ["1.95", "3.40", "3.75"],
    totals: { line: 3.5, over: "2.15", under: "1.70" },
    btts: { yes: "1.45", no: "2.65" },
  },
  {
    sportKey: "basketball_nba",
    sportTitle: "Basketball NBA",
    league: "NBA",
    homeTeam: "Boston Celtics",
    awayTeam: "LA Lakers",
    isLive: true,
    liveMinute: "Q3 04:12",
    score: "78 - 72",
    hoursFromNow: 0,
    h2h: ["1.42", "2.90"],
    totals: { line: 224.5, over: "1.91", under: "1.91" },
    spreads: { homePoint: -6.5, homePrice: "1.91", awayPrice: "1.91" },
  },
  {
    sportKey: "basketball_nba",
    sportTitle: "Basketball NBA",
    league: "NBA",
    homeTeam: "Golden State Warriors",
    awayTeam: "Milwaukee Bucks",
    isLive: false,
    hoursFromNow: 6,
    h2h: ["1.75", "2.15"],
    totals: { line: 232.0, over: "1.90", under: "1.90" },
    spreads: { homePoint: -2.5, homePrice: "1.90", awayPrice: "1.90" },
  },
  {
    sportKey: "tennis_atp",
    sportTitle: "ATP Tennis",
    league: "ATP Tour",
    homeTeam: "Novak Djokovic",
    awayTeam: "Carlos Alcaraz",
    isLive: true,
    liveMinute: "Set 2 (6-4, 3-2)",
    score: "1 - 0",
    hoursFromNow: 0,
    h2h: ["1.72", "2.12"],
    totals: { line: 22.5, over: "1.85", under: "1.95" },
  },
  {
    sportKey: "tennis_atp",
    sportTitle: "ATP Tennis",
    league: "ATP Tour",
    homeTeam: "Jannik Sinner",
    awayTeam: "Daniil Medvedev",
    isLive: false,
    hoursFromNow: 18,
    h2h: ["1.55", "2.45"],
    totals: { line: 21.5, over: "1.90", under: "1.90" },
  },
  {
    sportKey: "mma_mixed_martial_arts",
    sportTitle: "MMA / UFC",
    league: "UFC Main Card",
    homeTeam: "Islam Makhachev",
    awayTeam: "Arman Tsarukyan",
    isLive: false,
    hoursFromNow: 48,
    h2h: ["1.38", "3.10"],
    totals: { line: 2.5, over: "1.75", under: "2.05" },
  },
  {
    sportKey: "americanfootball_nfl",
    sportTitle: "NFL Football",
    league: "NFL",
    homeTeam: "Kansas City Chiefs",
    awayTeam: "San Francisco 49ers",
    isLive: false,
    hoursFromNow: 72,
    h2h: ["1.80", "2.05"],
    totals: { line: 47.5, over: "1.91", under: "1.91" },
    spreads: { homePoint: -1.5, homePrice: "1.91", awayPrice: "1.91" },
  },
];

function futureIso(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString();
}

export function getMockEvents(sportKey?: string): NormalizedEvent[] {
  const now = new Date().toISOString();

  return DEMO_MATCH_DEFINITIONS
    .filter((def) => !sportKey || def.sportKey === sportKey || (sportKey === "live" && def.isLive))
    .map((def, i) => {
      const eventId = `demo-${def.sportKey}-${i}`;
      const markets = [];

      // 1. Moneyline / 1X2 Market
      const h2hOutcomes = [
        {
          externalId: `h2h:demo_book:${def.homeTeam}:`,
          name: def.homeTeam,
          price: def.h2h[0],
          point: null,
          marketKey: "h2h",
          bookmakerKey: "demo_book",
          eventExternalId: eventId,
          lastUpdated: now,
        },
      ];

      if (def.h2h[2]) {
        h2hOutcomes.push({
          externalId: `h2h:demo_book:Draw:`,
          name: "Draw",
          price: def.h2h[2],
          point: null,
          marketKey: "h2h",
          bookmakerKey: "demo_book",
          eventExternalId: eventId,
          lastUpdated: now,
        });
      }

      h2hOutcomes.push({
        externalId: `h2h:demo_book:${def.awayTeam}:`,
        name: def.awayTeam,
        price: def.h2h[1],
        point: null,
        marketKey: "h2h",
        bookmakerKey: "demo_book",
        eventExternalId: eventId,
        lastUpdated: now,
      });

      markets.push({
        key: "h2h",
        name: def.h2h[2] ? "1X2 (Match Winner)" : "Moneyline",
        bookmakerKey: "demo_book",
        eventExternalId: eventId,
        lastUpdated: now,
        outcomes: h2hOutcomes,
      });

      // 2. Totals Market
      if (def.totals) {
        markets.push({
          key: "totals",
          name: `Total Points/Goals (${def.totals.line})`,
          bookmakerKey: "demo_book",
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `totals:demo_book:Over:${def.totals.line}`,
              name: `Over ${def.totals.line}`,
              price: def.totals.over,
              point: def.totals.line.toString(),
              marketKey: "totals",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
            {
              externalId: `totals:demo_book:Under:${def.totals.line}`,
              name: `Under ${def.totals.line}`,
              price: def.totals.under,
              point: def.totals.line.toString(),
              marketKey: "totals",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        });
      }

      // 3. Spreads Market
      if (def.spreads) {
        markets.push({
          key: "spreads",
          name: `Spread / Handicap (${def.spreads.homePoint > 0 ? "+" : ""}${def.spreads.homePoint})`,
          bookmakerKey: "demo_book",
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `spreads:demo_book:${def.homeTeam}:${def.spreads.homePoint}`,
              name: `${def.homeTeam} (${def.spreads.homePoint > 0 ? "+" : ""}${def.spreads.homePoint})`,
              price: def.spreads.homePrice,
              point: def.spreads.homePoint.toString(),
              marketKey: "spreads",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
            {
              externalId: `spreads:demo_book:${def.awayTeam}:${-def.spreads.homePoint}`,
              name: `${def.awayTeam} (${-def.spreads.homePoint > 0 ? "+" : ""}${-def.spreads.homePoint})`,
              price: def.spreads.awayPrice,
              point: (-def.spreads.homePoint).toString(),
              marketKey: "spreads",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        });
      }

      // 4. BTTS Market
      if (def.btts) {
        markets.push({
          key: "btts",
          name: "Both Teams To Score",
          bookmakerKey: "demo_book",
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `btts:demo_book:Yes:`,
              name: "Yes",
              price: def.btts.yes,
              point: null,
              marketKey: "btts",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
            {
              externalId: `btts:demo_book:No:`,
              name: "No",
              price: def.btts.no,
              point: null,
              marketKey: "btts",
              bookmakerKey: "demo_book",
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        });
      }

      return {
        externalId: eventId,
        sportKey: def.sportKey,
        sportTitle: def.sportTitle,
        league: def.league,
        homeTeam: def.homeTeam,
        awayTeam: def.awayTeam,
        commenceTime: futureIso(def.hoursFromNow),
        isLive: def.isLive,
        liveMinute: def.liveMinute,
        score: def.score,
        lastUpdated: now,
        bookmakers: [{ key: "demo_book", name: "Demo Sportsbook", region: null, lastUpdated: now }],
        markets,
      };
    });
}

export function isDemoMode(): boolean {
  return !process.env.ODDS_API_KEY;
}
