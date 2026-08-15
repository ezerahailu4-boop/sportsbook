import type { NormalizedEvent, NormalizedMarket } from "./odds-normalizer";

interface FixtureRaw {
  MatchNumber: number;
  RoundNumber: number;
  DateUtc: string;
  Location: string;
  HomeTeam: string;
  AwayTeam: string;
  Group?: string | null;
  HomeTeamScore?: number | null;
  AwayTeamScore?: number | null;
}

const LEAGUE_FEED_MAP: Record<string, { feedUrl: string; leagueName: string; sportTitle: string }> = {
  soccer_epl: {
    feedUrl: "https://fixturedownload.com/feed/json/epl-2024",
    leagueName: "Premier League",
    sportTitle: "English Premier League",
  },
  soccer_spain_la_liga: {
    feedUrl: "https://fixturedownload.com/feed/json/la-liga-2024",
    leagueName: "La Liga",
    sportTitle: "La Liga - Spain",
  },
  soccer_germany_bundesliga: {
    feedUrl: "https://fixturedownload.com/feed/json/bundesliga-2024",
    leagueName: "Bundesliga",
    sportTitle: "Bundesliga - Germany",
  },
  soccer_italy_serie_a: {
    feedUrl: "https://fixturedownload.com/feed/json/serie-a-2024",
    leagueName: "Serie A",
    sportTitle: "Serie A - Italy",
  },
  soccer_france_ligue_one: {
    feedUrl: "https://fixturedownload.com/feed/json/ligue-1-2024",
    leagueName: "Ligue 1",
    sportTitle: "Ligue 1 - France",
  },
  soccer_uefa_champs_league: {
    feedUrl: "https://fixturedownload.com/feed/json/champions-league-2024",
    leagueName: "Champions League",
    sportTitle: "UEFA Champions League",
  },
  soccer_usa_mls: {
    feedUrl: "https://fixturedownload.com/feed/json/mls-2024",
    leagueName: "MLS",
    sportTitle: "Major League Soccer",
  },
  americanfootball_nfl: {
    feedUrl: "https://fixturedownload.com/feed/json/nfl-2024",
    leagueName: "NFL",
    sportTitle: "NFL Football",
  },
};

// Power ratings for realistic odds calculation (higher = stronger team)
const TEAM_RATINGS: Record<string, number> = {
  "Man City": 92,
  "Liverpool": 90,
  "Arsenal": 89,
  "Real Madrid": 93,
  "Barcelona": 90,
  "Bayern Munich": 91,
  "Bayer Leverkusen": 87,
  "Inter": 88,
  "Juventus": 85,
  "AC Milan": 84,
  "PSG": 89,
  "Chelsea": 84,
  "Spurs": 83,
  "Man Utd": 82,
  "Newcastle": 83,
  "Aston Villa": 83,
  "Atletico Madrid": 86,
  "Dortmund": 85,
  "RB Leipzig": 84,
  "Napoli": 84,
  "Atalanta": 83,
  "Monaco": 82,
  "Marseille": 81,
  "LAFC": 78,
  "Inter Miami": 80,
  "Columbus Crew": 77,
};

function getTeamRating(teamName: string): number {
  return TEAM_RATINGS[teamName] ?? 75;
}

function calculateOdds(homeTeam: string, awayTeam: string, sportKey: string): {
  h2h: [string, string, string?];
  totals: { line: number; over: string; under: string };
  spreads: { homePoint: number; homePrice: string; awayPrice: string };
  btts: { yes: string; no: string };
} {
  const homeRate = getTeamRating(homeTeam) + 3; // Home advantage
  const awayRate = getTeamRating(awayTeam);
  const diff = homeRate - awayRate;

  // Win probabilities
  let homeProb = 0.42 + diff * 0.015;
  let awayProb = 0.32 - diff * 0.012;
  let drawProb = 0.26 - Math.abs(diff) * 0.003;

  // Normalize
  const totalProb = homeProb + awayProb + drawProb;
  homeProb = Math.max(0.12, Math.min(0.80, homeProb / totalProb));
  awayProb = Math.max(0.10, Math.min(0.75, awayProb / totalProb));
  drawProb = Math.max(0.12, Math.min(0.35, 1 - homeProb - awayProb));

  // Add 5% bookmaker margin
  const margin = 1.06;
  const homeOdds = (margin / homeProb).toFixed(2);
  const awayOdds = (margin / awayProb).toFixed(2);
  const drawOdds = (margin / drawProb).toFixed(2);

  const isFootball = sportKey.startsWith("soccer");

  return {
    h2h: isFootball ? [homeOdds, awayOdds, drawOdds] : [homeOdds, awayOdds],
    totals: {
      line: isFootball ? 2.5 : 45.5,
      over: (1.85 + (Math.random() * 0.1 - 0.05)).toFixed(2),
      under: (1.95 + (Math.random() * 0.1 - 0.05)).toFixed(2),
    },
    spreads: {
      homePoint: diff > 4 ? -1.5 : diff < -4 ? 1.5 : -0.5,
      homePrice: (1.90 + (Math.random() * 0.08 - 0.04)).toFixed(2),
      awayPrice: (1.90 + (Math.random() * 0.08 - 0.04)).toFixed(2),
    },
    btts: {
      yes: (1.70 + (Math.random() * 0.1 - 0.05)).toFixed(2),
      no: (2.05 + (Math.random() * 0.1 - 0.05)).toFixed(2),
    },
  };
}

// In-memory cache for open fixtures
const FIXTURE_CACHE = new Map<string, { events: NormalizedEvent[]; cachedAt: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 mins

export async function fetchOpenFixtures(sportKey: string): Promise<NormalizedEvent[]> {
  const cached = FIXTURE_CACHE.get(sportKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.events;
  }

  const leagueConfig = LEAGUE_FEED_MAP[sportKey];
  if (!leagueConfig) {
    return [];
  }

  try {
    const res = await fetch(leagueConfig.feedUrl, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Open feed returned status ${res.status}`);
    }

    const fixtures: FixtureRaw[] = await res.json();
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return [];
    }

    const now = new Date();
    const currentBaseMs = now.getTime();

    // Map the fixtures dynamically across today, tomorrow, and the coming days
    const events: NormalizedEvent[] = fixtures.slice(0, 40).map((f, index) => {
      const odds = calculateOdds(f.HomeTeam, f.AwayTeam, sportKey);
      const eventId = `open-${sportKey}-${f.MatchNumber || index}`;
      
      // Group matches into:
      // index 0..2: In-Play Live Now
      // index 3..15: Today's upcoming games (+2h to +8h)
      // index 16..40: Tomorrow and upcoming week (+24h to +72h)
      const isLive = index < 2;
      let matchDate: Date;
      let liveMinute: string | undefined;
      let score: string | undefined;

      if (isLive) {
        matchDate = new Date(currentBaseMs - (index === 0 ? 68 * 60 * 1000 : 34 * 60 * 1000));
        liveMinute = index === 0 ? "68'" : "34'";
        score = index === 0 ? "2 - 1" : "1 - 0";
      } else if (index < 12) {
        // Today's matches
        matchDate = new Date(currentBaseMs + (index * 45 + 90) * 60 * 1000);
      } else {
        // Next few days
        matchDate = new Date(currentBaseMs + (index * 3 + 24) * 3600 * 1000);
      }

      const lastUpdated = now.toISOString();
      const markets: NormalizedMarket[] = [
        {
          key: "h2h",
          name: "Match Result (1X2)",
          bookmakerKey: "apex_sports",
          eventExternalId: eventId,
          lastUpdated,
          outcomes: [
            {
              externalId: `h2h:apex:${f.HomeTeam}`,
              name: f.HomeTeam,
              price: odds.h2h[0],
              point: null,
              marketKey: "h2h",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
            ...(odds.h2h[2]
              ? [
                  {
                    externalId: `h2h:apex:Draw`,
                    name: "Draw",
                    price: odds.h2h[2],
                    point: null,
                    marketKey: "h2h",
                    bookmakerKey: "apex_sports",
                    eventExternalId: eventId,
                    lastUpdated,
                  },
                ]
              : []),
            {
              externalId: `h2h:apex:${f.AwayTeam}`,
              name: f.AwayTeam,
              price: odds.h2h[1],
              point: null,
              marketKey: "h2h",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
          ],
        },
        {
          key: "totals",
          name: `Total Goals Over/Under ${odds.totals.line}`,
          bookmakerKey: "apex_sports",
          eventExternalId: eventId,
          lastUpdated,
          outcomes: [
            {
              externalId: `totals:apex:Over:${odds.totals.line}`,
              name: `Over ${odds.totals.line}`,
              price: odds.totals.over,
              point: odds.totals.line.toString(),
              marketKey: "totals",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
            {
              externalId: `totals:apex:Under:${odds.totals.line}`,
              name: `Under ${odds.totals.line}`,
              price: odds.totals.under,
              point: odds.totals.line.toString(),
              marketKey: "totals",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
          ],
        },
        {
          key: "spreads",
          name: `Handicap Spread (${odds.spreads.homePoint > 0 ? "+" : ""}${odds.spreads.homePoint})`,
          bookmakerKey: "apex_sports",
          eventExternalId: eventId,
          lastUpdated,
          outcomes: [
            {
              externalId: `spreads:apex:${f.HomeTeam}:${odds.spreads.homePoint}`,
              name: `${f.HomeTeam} (${odds.spreads.homePoint > 0 ? "+" : ""}${odds.spreads.homePoint})`,
              price: odds.spreads.homePrice,
              point: odds.spreads.homePoint.toString(),
              marketKey: "spreads",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
            {
              externalId: `spreads:apex:${f.AwayTeam}:${-odds.spreads.homePoint}`,
              name: `${f.AwayTeam} (${-odds.spreads.homePoint > 0 ? "+" : ""}${-odds.spreads.homePoint})`,
              price: odds.spreads.awayPrice,
              point: (-odds.spreads.homePoint).toString(),
              marketKey: "spreads",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
          ],
        },
        {
          key: "btts",
          name: "Both Teams To Score",
          bookmakerKey: "apex_sports",
          eventExternalId: eventId,
          lastUpdated,
          outcomes: [
            {
              externalId: `btts:apex:Yes`,
              name: "Yes",
              price: odds.btts.yes,
              point: null,
              marketKey: "btts",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
            {
              externalId: `btts:apex:No`,
              name: "No",
              price: odds.btts.no,
              point: null,
              marketKey: "btts",
              bookmakerKey: "apex_sports",
              eventExternalId: eventId,
              lastUpdated,
            },
          ],
        },
      ];

      return {
        externalId: eventId,
        sportKey,
        sportTitle: leagueConfig.sportTitle,
        league: leagueConfig.leagueName,
        homeTeam: f.HomeTeam,
        awayTeam: f.AwayTeam,
        commenceTime: matchDate.toISOString(),
        isLive,
        liveMinute,
        score,
        lastUpdated,
        bookmakers: [{ key: "apex_sports", name: "ApexBook Direct Feed", region: "global", lastUpdated }],
        markets,
      };
    });

    FIXTURE_CACHE.set(sportKey, { events, cachedAt: Date.now() });
    return events;
  } catch (err) {
    console.error(`Failed to fetch open fixtures for ${sportKey}:`, (err as Error).message);
    return [];
  }
}
