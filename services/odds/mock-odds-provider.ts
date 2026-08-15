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
  // --- 1. ENGLISH PREMIER LEAGUE ---
  {
    sportKey: "soccer_epl",
    sportTitle: "English Premier League",
    league: "Premier League",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    isLive: true,
    liveMinute: "68'",
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
    sportKey: "soccer_epl",
    sportTitle: "English Premier League",
    league: "Premier League",
    homeTeam: "Tottenham Hotspur",
    awayTeam: "Manchester United",
    isLive: false,
    hoursFromNow: 24,
    h2h: ["2.20", "3.10", "3.50"],
    totals: { line: 3.5, over: "2.10", under: "1.72" },
    spreads: { homePoint: -0.5, homePrice: "2.20", awayPrice: "1.68" },
    btts: { yes: "1.48", no: "2.60" },
  },

  // --- 2. SPANISH LA LIGA ---
  {
    sportKey: "soccer_spain_la_liga",
    sportTitle: "Spanish La Liga",
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    isLive: true,
    liveMinute: "42'",
    score: "1 - 1",
    hoursFromNow: 0,
    h2h: ["2.10", "3.20", "3.40"],
    totals: { line: 2.5, over: "1.65", under: "2.20" },
    spreads: { homePoint: 0.0, homePrice: "1.60", awayPrice: "2.30" },
    btts: { yes: "1.50", no: "2.50" },
  },
  {
    sportKey: "soccer_spain_la_liga",
    sportTitle: "Spanish La Liga",
    league: "La Liga",
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    isLive: false,
    hoursFromNow: 5,
    h2h: ["1.58", "5.25", "3.90"],
    totals: { line: 2.5, over: "1.90", under: "1.90" },
    spreads: { homePoint: -1.0, homePrice: "2.05", awayPrice: "1.78" },
    btts: { yes: "1.95", no: "1.80" },
  },

  // --- 3. UEFA CHAMPIONS LEAGUE ---
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
    sportKey: "soccer_uefa_champs_league",
    sportTitle: "UEFA Champions League",
    league: "Champions League",
    homeTeam: "Inter Milan",
    awayTeam: "Borussia Dortmund",
    isLive: false,
    hoursFromNow: 28,
    h2h: ["1.80", "4.20", "3.70"],
    totals: { line: 2.5, over: "1.85", under: "1.95" },
    btts: { yes: "1.70", no: "2.10" },
  },

  // --- 4. GERMAN BUNDESLIGA ---
  {
    sportKey: "soccer_germany_bundesliga",
    sportTitle: "German Bundesliga",
    league: "Bundesliga",
    homeTeam: "Bayer Leverkusen",
    awayTeam: "RB Leipzig",
    isLive: true,
    liveMinute: "81'",
    score: "3 - 2",
    hoursFromNow: 0,
    h2h: ["1.45", "7.00", "4.50"],
    totals: { line: 5.5, over: "2.20", under: "1.65" },
    btts: { yes: "1.30", no: "3.20" },
  },
  {
    sportKey: "soccer_germany_bundesliga",
    sportTitle: "German Bundesliga",
    league: "Bundesliga",
    homeTeam: "Eintracht Frankfurt",
    awayTeam: "VfB Stuttgart",
    isLive: false,
    hoursFromNow: 12,
    h2h: ["2.40", "2.75", "3.60"],
    totals: { line: 3.5, over: "2.05", under: "1.75" },
    btts: { yes: "1.52", no: "2.40" },
  },

  // --- 5. ITALIAN SERIE A ---
  {
    sportKey: "soccer_italy_serie_a",
    sportTitle: "Italian Serie A",
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    isLive: false,
    hoursFromNow: 8,
    h2h: ["2.25", "3.20", "3.10"],
    totals: { line: 2.5, over: "2.10", under: "1.72" },
    btts: { yes: "1.85", no: "1.90" },
  },
  {
    sportKey: "soccer_italy_serie_a",
    sportTitle: "Italian Serie A",
    league: "Serie A",
    homeTeam: "Napoli",
    awayTeam: "AS Roma",
    isLive: false,
    hoursFromNow: 30,
    h2h: ["1.90", "3.80", "3.45"],
    totals: { line: 2.5, over: "1.80", under: "2.00" },
    btts: { yes: "1.72", no: "2.05" },
  },

  // --- 6. FRENCH LIGUE 1 ---
  {
    sportKey: "soccer_france_ligue_one",
    sportTitle: "French Ligue 1",
    league: "Ligue 1",
    homeTeam: "Monaco",
    awayTeam: "Marseille",
    isLive: false,
    hoursFromNow: 14,
    h2h: ["2.15", "3.10", "3.50"],
    totals: { line: 2.5, over: "1.75", under: "2.05" },
    btts: { yes: "1.60", no: "2.25" },
  },

  // --- 7. US MAJOR LEAGUE SOCCER ---
  {
    sportKey: "soccer_usa_mls",
    sportTitle: "US Major League Soccer",
    league: "MLS",
    homeTeam: "Inter Miami CF",
    awayTeam: "LA Galaxy",
    isLive: true,
    liveMinute: "55'",
    score: "2 - 0",
    hoursFromNow: 0,
    h2h: ["1.35", "8.50", "5.20"],
    totals: { line: 3.5, over: "1.85", under: "1.95" },
    btts: { yes: "1.60", no: "2.25" },
  },

  // --- 8. SAUDI PRO LEAGUE ---
  {
    sportKey: "soccer_saudi_arabia_pro_league",
    sportTitle: "Saudi Pro League",
    league: "Saudi Pro League",
    homeTeam: "Al Hilal",
    awayTeam: "Al Nassr",
    isLive: false,
    hoursFromNow: 16,
    h2h: ["2.00", "3.30", "3.60"],
    totals: { line: 3.5, over: "1.95", under: "1.82" },
    btts: { yes: "1.45", no: "2.60" },
  },

  // --- 9. BASKETBALL NBA ---
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
    sportKey: "basketball_nba",
    sportTitle: "Basketball NBA",
    league: "NBA",
    homeTeam: "Dallas Mavericks",
    awayTeam: "Denver Nuggets",
    isLive: false,
    hoursFromNow: 10,
    h2h: ["1.88", "1.98"],
    totals: { line: 228.5, over: "1.91", under: "1.91" },
    spreads: { homePoint: -1.5, homePrice: "1.91", awayPrice: "1.91" },
  },

  // --- 10. BASKETBALL EUROLEAGUE ---
  {
    sportKey: "basketball_euroleague",
    sportTitle: "Basketball EuroLeague",
    league: "EuroLeague",
    homeTeam: "Real Madrid Basketball",
    awayTeam: "Panathinaikos",
    isLive: false,
    hoursFromNow: 20,
    h2h: ["1.55", "2.45"],
    totals: { line: 165.5, over: "1.90", under: "1.90" },
    spreads: { homePoint: -4.5, homePrice: "1.90", awayPrice: "1.90" },
  },

  // --- 11. TENNIS ATP & WTA ---
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
    sportKey: "tennis_wta",
    sportTitle: "WTA Tennis",
    league: "WTA Tour",
    homeTeam: "Aryna Sabalenka",
    awayTeam: "Iga Swiatek",
    isLive: false,
    hoursFromNow: 22,
    h2h: ["1.95", "1.85"],
    totals: { line: 21.5, over: "1.88", under: "1.92" },
  },

  // --- 12. AMERICAN FOOTBALL NFL ---
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
  {
    sportKey: "americanfootball_nfl",
    sportTitle: "NFL Football",
    league: "NFL",
    homeTeam: "Philadelphia Eagles",
    awayTeam: "Dallas Cowboys",
    isLive: false,
    hoursFromNow: 76,
    h2h: ["1.65", "2.30"],
    totals: { line: 51.0, over: "1.91", under: "1.91" },
    spreads: { homePoint: -3.5, homePrice: "1.91", awayPrice: "1.91" },
  },

  // --- 13. BASEBALL MLB ---
  {
    sportKey: "baseball_mlb",
    sportTitle: "MLB Baseball",
    league: "MLB",
    homeTeam: "New York Yankees",
    awayTeam: "Boston Red Sox",
    isLive: true,
    liveMinute: "Top 7th",
    score: "4 - 3",
    hoursFromNow: 0,
    h2h: ["1.60", "2.35"],
    totals: { line: 8.5, over: "1.85", under: "1.95" },
    spreads: { homePoint: -1.5, homePrice: "2.25", awayPrice: "1.65" },
  },
  {
    sportKey: "baseball_mlb",
    sportTitle: "MLB Baseball",
    league: "MLB",
    homeTeam: "Los Angeles Dodgers",
    awayTeam: "San Diego Padres",
    isLive: false,
    hoursFromNow: 8,
    h2h: ["1.50", "2.65"],
    totals: { line: 8.0, over: "1.90", under: "1.90" },
    spreads: { homePoint: -1.5, homePrice: "2.10", awayPrice: "1.75" },
  },

  // --- 14. ICE HOCKEY NHL ---
  {
    sportKey: "icehockey_nhl",
    sportTitle: "NHL Ice Hockey",
    league: "NHL",
    homeTeam: "Edmonton Oilers",
    awayTeam: "Florida Panthers",
    isLive: true,
    liveMinute: "P2 11:34",
    score: "2 - 2",
    hoursFromNow: 0,
    h2h: ["1.95", "1.88"],
    totals: { line: 6.5, over: "1.95", under: "1.85" },
    spreads: { homePoint: -1.5, homePrice: "2.60", awayPrice: "1.52" },
  },
  {
    sportKey: "icehockey_nhl",
    sportTitle: "NHL Ice Hockey",
    league: "NHL",
    homeTeam: "Toronto Maple Leafs",
    awayTeam: "Boston Bruins",
    isLive: false,
    hoursFromNow: 15,
    h2h: ["1.85", "1.98"],
    totals: { line: 5.5, over: "1.80", under: "2.05" },
  },

  // --- 15. COMBAT SPORTS UFC / BOXING ---
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
    sportKey: "boxing_boxing",
    sportTitle: "Championship Boxing",
    league: "World Boxing Heavyweight",
    homeTeam: "Oleksandr Usyk",
    awayTeam: "Tyson Fury",
    isLive: false,
    hoursFromNow: 96,
    h2h: ["1.85", "2.05", "15.00"],
    totals: { line: 10.5, over: "1.60", under: "2.30" },
  },

  // --- 16. CRICKET IPL / T20 ---
  {
    sportKey: "cricket_ipl",
    sportTitle: "IPL Cricket",
    league: "Indian Premier League",
    homeTeam: "Chennai Super Kings",
    awayTeam: "Mumbai Indians",
    isLive: true,
    liveMinute: "14.2 Overs",
    score: "128/3 - 0/0",
    hoursFromNow: 0,
    h2h: ["1.75", "2.10"],
    totals: { line: 175.5, over: "1.88", under: "1.88" },
  },
  {
    sportKey: "rugby_six_nations",
    sportTitle: "Six Nations Rugby",
    league: "Six Nations",
    homeTeam: "Ireland",
    awayTeam: "France",
    isLive: false,
    hoursFromNow: 44,
    h2h: ["1.65", "2.35", "19.00"],
    totals: { line: 42.5, over: "1.90", under: "1.90" },
  },
];

function futureIso(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString();
}

export function getMockEvents(sportKey?: string): NormalizedEvent[] {
  const now = new Date().toISOString();

  const filtered = DEMO_MATCH_DEFINITIONS.filter((def) => {
    if (!sportKey) return true;
    if (sportKey === "live") return def.isLive;
    return def.sportKey === sportKey;
  });

  // If a sport has no explicit definition, generate dynamic mock matches for that sport key
  if (filtered.length === 0 && sportKey && sportKey !== "live") {
    const formattedTitle = sportKey.replace(/_/g, " ").toUpperCase();
    return [
      {
        externalId: `demo-${sportKey}-dyn-1`,
        sportKey: sportKey,
        sportTitle: formattedTitle,
        league: formattedTitle,
        homeTeam: "Team Alpha",
        awayTeam: "Team Beta",
        commenceTime: futureIso(4),
        isLive: false,
        lastUpdated: now,
        bookmakers: [{ key: "demo_book", name: "Demo Sportsbook", region: null, lastUpdated: now }],
        markets: [
          {
            key: "h2h",
            name: "1X2 (Match Winner)",
            bookmakerKey: "demo_book",
            eventExternalId: `demo-${sportKey}-dyn-1`,
            lastUpdated: now,
            outcomes: [
              { externalId: `h2h:demo:TeamAlpha`, name: "Team Alpha", price: "1.90", point: null, marketKey: "h2h", bookmakerKey: "demo_book", eventExternalId: `demo-${sportKey}-dyn-1`, lastUpdated: now },
              { externalId: `h2h:demo:Draw`, name: "Draw", price: "3.40", point: null, marketKey: "h2h", bookmakerKey: "demo_book", eventExternalId: `demo-${sportKey}-dyn-1`, lastUpdated: now },
              { externalId: `h2h:demo:TeamBeta`, name: "Team Beta", price: "3.80", point: null, marketKey: "h2h", bookmakerKey: "demo_book", eventExternalId: `demo-${sportKey}-dyn-1`, lastUpdated: now },
            ],
          },
        ],
      },
    ];
  }

  return filtered.map((def, i) => {
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
