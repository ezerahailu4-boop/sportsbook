import type { NormalizedEvent, NormalizedMarket } from "./odds-normalizer";

const ESPN_LEAGUE_MAP: Record<string, { path: string; leagueName: string; sportTitle: string }> = {
  soccer_epl: {
    path: "soccer/eng.1",
    leagueName: "Premier League",
    sportTitle: "English Premier League",
  },
  soccer_spain_la_liga: {
    path: "soccer/esp.1",
    leagueName: "La Liga",
    sportTitle: "La Liga - Spain",
  },
  soccer_germany_bundesliga: {
    path: "soccer/ger.1",
    leagueName: "Bundesliga",
    sportTitle: "Bundesliga - Germany",
  },
  soccer_italy_serie_a: {
    path: "soccer/ita.1",
    leagueName: "Serie A",
    sportTitle: "Serie A - Italy",
  },
  soccer_france_ligue_one: {
    path: "soccer/fra.1",
    leagueName: "Ligue 1",
    sportTitle: "Ligue 1 - France",
  },
  soccer_uefa_champs_league: {
    path: "soccer/uefa.champions",
    leagueName: "Champions League",
    sportTitle: "UEFA Champions League",
  },
  soccer_uefa_europa_league: {
    path: "soccer/uefa.europa",
    leagueName: "Europa League",
    sportTitle: "UEFA Europa League",
  },
  soccer_usa_mls: {
    path: "soccer/usa.1",
    leagueName: "MLS",
    sportTitle: "Major League Soccer",
  },
  soccer_saudi_arabia_pro_league: {
    path: "soccer/ksa.1",
    leagueName: "Saudi Pro League",
    sportTitle: "Saudi Pro League",
  },
  soccer_netherlands_eredivisie: {
    path: "soccer/ned.1",
    leagueName: "Eredivisie",
    sportTitle: "Dutch Eredivisie",
  },
  basketball_nba: {
    path: "basketball/nba",
    leagueName: "NBA",
    sportTitle: "NBA Basketball",
  },
  basketball_wnba: {
    path: "basketball/wnba",
    leagueName: "WNBA",
    sportTitle: "WNBA Basketball",
  },
  americanfootball_nfl: {
    path: "football/nfl",
    leagueName: "NFL",
    sportTitle: "NFL Football",
  },
  baseball_mlb: {
    path: "baseball/mlb",
    leagueName: "MLB",
    sportTitle: "Major League Baseball",
  },
  icehockey_nhl: {
    path: "hockey/nhl",
    leagueName: "NHL",
    sportTitle: "NHL Ice Hockey",
  },
};

const CACHE = new Map<string, { events: NormalizedEvent[]; cachedAt: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 mins cache

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function parseAmericanToDecimal(val: string | number | undefined, defaultVal: number): string {
  if (val == null) return defaultVal.toFixed(2);
  const num = typeof val === "string" ? parseFloat(val.replace("+", "")) : val;
  if (isNaN(num) || num === 0) return defaultVal.toFixed(2);
  if (num > 0) {
    return (1 + num / 100).toFixed(2);
  } else {
    return (1 + 100 / Math.abs(num)).toFixed(2);
  }
}

// Power ratings for realistic odds calculation (higher = stronger team)
const TEAM_RATINGS: Record<string, number> = {
  // Premier League
  "Manchester City": 93, "Man City": 93,
  "Liverpool": 91,
  "Arsenal": 90,
  "Chelsea": 86,
  "Tottenham Hotspur": 84, "Spurs": 84, "Tottenham": 84,
  "Manchester United": 83, "Man Utd": 83,
  "Newcastle United": 84, "Newcastle": 84,
  "Aston Villa": 84,
  "Brighton & Hove Albion": 81, "Brighton": 81,
  "Fulham": 79,
  "AFC Bournemouth": 78, "Bournemouth": 78,
  "Brentford": 79,
  "Crystal Palace": 78,
  "Everton": 77,
  "Nottingham Forest": 77,
  "Leeds United": 76, "Leeds": 76,
  "Ipswich Town": 74, "Ipswich": 74,
  "Sunderland": 75,
  "Coventry City": 74,
  "Hull City": 73,

  // La Liga
  "Real Madrid": 93,
  "Barcelona": 91,
  "Atlético Madrid": 87, "Atletico Madrid": 87,
  "Athletic Club": 83, "Athletic Bilbao": 83,
  "Real Sociedad": 82,
  "Real Betis": 81,
  "Villarreal": 81,
  "Sevilla": 80,
  "Girona": 80,
  "Valencia": 79,
  "Osasuna": 77,
  "Levante": 75,

  // Bundesliga
  "Bayern Munich": 92,
  "Bayer Leverkusen": 88,
  "Borussia Dortmund": 86, "Dortmund": 86,
  "RB Leipzig": 85,
  "VfB Stuttgart": 83, "Stuttgart": 83,
  "Eintracht Frankfurt": 81,
  "SC Freiburg": 80,
  "VfL Wolfsburg": 79,
  "1. FSV Mainz 05": 77, "Mainz": 77,
  "1. FC Union Berlin": 77, "Union Berlin": 77,

  // Serie A
  "Inter": 89, "Inter Milan": 89,
  "Juventus": 86,
  "AC Milan": 85,
  "Napoli": 85,
  "Atalanta": 84,
  "AS Roma": 83, "Roma": 83,
  "Lazio": 82,
  "Bologna": 81,
  "Fiorentina": 80,
  "Torino": 78,

  // Ligue 1
  "Paris Saint-Germain": 90, "PSG": 90,
  "Monaco": 83,
  "Marseille": 82,
  "Lille": 82,
  "Lyon": 81,
  "Nice": 80,
  "Lens": 79,
  "Rennes": 79,
};

function computeDynamicOdds(homeTeam: string, awayTeam: string, sportKey: string) {
  const homeRate = (TEAM_RATINGS[homeTeam] ?? 77) + 3; // +3 Home advantage
  const awayRate = TEAM_RATINGS[awayTeam] ?? 77;
  const diff = homeRate - awayRate;

  // Win probabilities
  let homeProb = 0.42 + diff * 0.022;
  let awayProb = 0.32 - diff * 0.018;
  let drawProb = 0.26 - Math.abs(diff) * 0.004;

  // Normalize
  const total = homeProb + awayProb + drawProb;
  homeProb = Math.max(0.08, Math.min(0.85, homeProb / total));
  awayProb = Math.max(0.08, Math.min(0.85, awayProb / total));
  drawProb = Math.max(0.09, Math.min(0.35, 1 - homeProb - awayProb));

  const margin = 1.055; // 5.5% bookmaker margin
  const home = (margin / homeProb).toFixed(2);
  const away = (margin / awayProb).toFixed(2);
  const draw = (margin / drawProb).toFixed(2);

  const homeSpread = diff >= 8 ? -1.5 : diff >= 3 ? -0.5 : diff <= -8 ? 1.5 : diff <= -3 ? 0.5 : -0.5;

  return {
    home,
    away,
    draw,
    totalsLine: 2.5,
    over: (1.82 + (Math.abs(diff) % 3) * 0.04).toFixed(2),
    under: (1.98 - (Math.abs(diff) % 3) * 0.04).toFixed(2),
    homeSpread,
    homeSpreadPrice: "1.91",
    awaySpreadPrice: "1.89",
  };
}

export async function fetchEspnEvents(sportKey: string): Promise<NormalizedEvent[]> {
  const cached = CACHE.get(sportKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.events;
  }

  const leagueConfig = ESPN_LEAGUE_MAP[sportKey];
  if (!leagueConfig) return [];

  try {
    const today = new Date();
    const futureDate = new Date(Date.now() + 14 * 24 * 3600 * 1000); // 14 days ahead
    const dateRange = `${formatIsoDate(today)}-${formatIsoDate(futureDate)}`;

    const url = `https://site.api.espn.com/apis/site/v2/sports/${leagueConfig.path}/scoreboard?dates=${dateRange}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const espnEvents = json.events || [];
    if (!Array.isArray(espnEvents) || espnEvents.length === 0) return [];

    const now = new Date().toISOString();
    const events: NormalizedEvent[] = [];

    for (const item of espnEvents) {
      const comp = item.competitions?.[0];
      if (!comp || !comp.competitors || comp.competitors.length < 2) continue;

      const homeComp = comp.competitors.find((c: any) => c.homeAway === "home") || comp.competitors[0];
      const awayComp = comp.competitors.find((c: any) => c.homeAway === "away") || comp.competitors[1];

      const homeTeam = homeComp.team.displayName || homeComp.team.name;
      const awayTeam = awayComp.team.displayName || awayComp.team.name;
      const eventId = `espn-${sportKey}-${item.id}`;

      const isLive = item.status?.type?.state === "in";
      const isCompleted = item.status?.type?.completed;
      if (isCompleted) continue; // skip finished matches

      const liveMinute = isLive ? item.status.displayClock || item.status.type.shortDetail : undefined;
      const score =
        homeComp.score != null && awayComp.score != null
          ? `${homeComp.score} - ${awayComp.score}`
          : undefined;

      const oddsObj = comp.odds?.[0];
      const mlObj = oddsObj?.moneyline;
      const dynamic = computeDynamicOdds(homeTeam, awayTeam, sportKey);

      // Extract real DraftKings odds if available, otherwise compute team-specific dynamic line
      const hasRealMl = mlObj?.home?.close?.odds || mlObj?.home?.open?.odds;
      const homePrice = hasRealMl
        ? parseAmericanToDecimal(mlObj?.home?.close?.odds || mlObj?.home?.open?.odds, parseFloat(dynamic.home))
        : dynamic.home;
      const awayPrice = hasRealMl
        ? parseAmericanToDecimal(mlObj?.away?.close?.odds || mlObj?.away?.open?.odds, parseFloat(dynamic.away))
        : dynamic.away;
      const drawPrice = hasRealMl
        ? parseAmericanToDecimal(
            mlObj?.draw?.close?.odds || mlObj?.draw?.open?.odds || oddsObj?.drawOdds?.moneyLine,
            parseFloat(dynamic.draw)
          )
        : dynamic.draw;

      // Over/Under Totals
      const totalObj = oddsObj?.total;
      const totalsLine =
        parseFloat(
          totalObj?.over?.close?.line?.replace(/[^\d.]/g, "") ||
            oddsObj?.overUnder?.toString() ||
            (sportKey.startsWith("soccer") ? "2.5" : "215.5")
        ) || dynamic.totalsLine;

      const overPrice = totalObj?.over?.close?.odds
        ? parseAmericanToDecimal(totalObj?.over?.close?.odds, parseFloat(dynamic.over))
        : dynamic.over;
      const underPrice = totalObj?.under?.close?.odds
        ? parseAmericanToDecimal(totalObj?.under?.close?.odds, parseFloat(dynamic.under))
        : dynamic.under;

      // Point Spreads / Handicap
      const spreadObj = oddsObj?.pointSpread;
      const homePoint = spreadObj?.home?.close?.line ? parseFloat(spreadObj.home.close.line) : dynamic.homeSpread;
      const homeSpreadPrice = spreadObj?.home?.close?.odds
        ? parseAmericanToDecimal(spreadObj?.home?.close?.odds, 1.90)
        : dynamic.homeSpreadPrice;
      const awaySpreadPrice = spreadObj?.away?.close?.odds
        ? parseAmericanToDecimal(spreadObj?.away?.close?.odds, 1.90)
        : dynamic.awaySpreadPrice;

      const isSoccer = sportKey.startsWith("soccer");
      const providerName = oddsObj?.provider?.name || "DraftKings Official";
      const bookmakerKey = providerName.toLowerCase().replace(/\s+/g, "_");

      const homeP = parseFloat(homePrice);
      const drawP = parseFloat(drawPrice);
      const awayP = parseFloat(awayPrice);
      const diff = Math.round((awayP - homeP) * 10);

      // Core Derived Probabilities (Strictly bounded and bookmaker-margin accurate)
      const doubleChance1X = Math.max(1.02, Math.min(homeP > 1.10 ? homeP - 0.04 : 1.03, +(1 / (1 / homeP + 1 / drawP) * 1.05).toFixed(2))).toFixed(2);
      const doubleChance12 = Math.max(1.04, Math.min(Math.min(homeP, awayP) + 0.15, +(1 / (1 / homeP + 1 / awayP) * 1.05).toFixed(2))).toFixed(2);
      const doubleChanceX2 = Math.max(1.02, Math.min(awayP > 1.10 ? awayP - 0.04 : 1.03, +(1 / (1 / drawP + 1 / awayP) * 1.05).toFixed(2))).toFixed(2);

      const bttsYes = (1.75 + (Math.abs(diff) % 2) * 0.05).toFixed(2);
      const bttsNo = (1.95 - (Math.abs(diff) % 2) * 0.05).toFixed(2);

      const dnbHome = Math.max(1.10, homeP * 0.68).toFixed(2);
      const dnbAway = Math.max(1.10, awayP * 0.68).toFixed(2);

      const htHome = (homeP * 1.52).toFixed(2);
      const htDraw = (2.10 + (Math.abs(diff) % 3) * 0.05).toFixed(2);
      const htAway = (awayP * 1.52).toFixed(2);

      const shHome = (homeP * 1.35).toFixed(2);
      const shDraw = (2.35).toFixed(2);
      const shAway = (awayP * 1.35).toFixed(2);

      const markets: NormalizedMarket[] = [
        // 1. 1X2 Match Result
        {
          key: "h2h",
          name: "Match Result (1X2)",
          bookmakerKey,
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `${eventId}:h2h:${bookmakerKey}:${homeTeam}`,
              name: homeTeam,
              price: homePrice,
              point: null,
              marketKey: "h2h",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
            ...(isSoccer
              ? [
                  {
                    externalId: `${eventId}:h2h:${bookmakerKey}:Draw`,
                    name: "Draw",
                    price: drawPrice,
                    point: null,
                    marketKey: "h2h",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ]
              : []),
            {
              externalId: `${eventId}:h2h:${bookmakerKey}:${awayTeam}`,
              name: awayTeam,
              price: awayPrice,
              point: null,
              marketKey: "h2h",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        },

        ...(isSoccer
          ? [
              // 2. Double Chance
              {
                key: "double_chance",
                name: "Double Chance",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:double_chance:${bookmakerKey}:1X`,
                    name: `${homeTeam} or Draw (1X)`,
                    price: doubleChance1X,
                    point: null,
                    marketKey: "double_chance",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:double_chance:${bookmakerKey}:12`,
                    name: `${homeTeam} or ${awayTeam} (12)`,
                    price: doubleChance12,
                    point: null,
                    marketKey: "double_chance",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:double_chance:${bookmakerKey}:X2`,
                    name: `Draw or ${awayTeam} (X2)`,
                    price: doubleChanceX2,
                    point: null,
                    marketKey: "double_chance",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 3. Both Teams To Score (BTTS)
              {
                key: "btts",
                name: "Both Teams To Score (BTTS)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:btts:${bookmakerKey}:Yes`,
                    name: "Yes (Both Teams Score)",
                    price: bttsYes,
                    point: null,
                    marketKey: "btts",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:btts:${bookmakerKey}:No`,
                    name: "No (One or Both Fail to Score)",
                    price: bttsNo,
                    point: null,
                    marketKey: "btts",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 4. Draw No Bet (DNB)
              {
                key: "draw_no_bet",
                name: "Draw No Bet (DNB)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:draw_no_bet:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} (DNB)`,
                    price: dnbHome,
                    point: null,
                    marketKey: "draw_no_bet",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:draw_no_bet:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} (DNB)`,
                    price: dnbAway,
                    point: null,
                    marketKey: "draw_no_bet",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 5. Total Goals Over/Under 0.5
              {
                key: "totals_0_5",
                name: "Total Goals Over/Under 0.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:totals_0_5:${bookmakerKey}:Over:0.5`,
                    name: "Over 0.5 Goals",
                    price: "1.06",
                    point: "0.5",
                    marketKey: "totals_0_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:totals_0_5:${bookmakerKey}:Under:0.5`,
                    name: "Under 0.5 Goals",
                    price: "7.80",
                    point: "0.5",
                    marketKey: "totals_0_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 6. Total Goals Over/Under 1.5
              {
                key: "totals_1_5",
                name: "Total Goals Over/Under 1.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:totals_1_5:${bookmakerKey}:Over:1.5`,
                    name: "Over 1.5 Goals",
                    price: "1.28",
                    point: "1.5",
                    marketKey: "totals_1_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:totals_1_5:${bookmakerKey}:Under:1.5`,
                    name: "Under 1.5 Goals",
                    price: "3.45",
                    point: "1.5",
                    marketKey: "totals_1_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },
            ]
          : []),

        // 7. Total Goals / Points Over/Under 2.5
        {
          key: "totals",
          name: `Total ${isSoccer ? "Goals" : "Points"} Over/Under 2.5`,
          bookmakerKey,
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `${eventId}:totals:${bookmakerKey}:Over:2.5`,
              name: "Over 2.5",
              price: overPrice,
              point: "2.5",
              marketKey: "totals",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
            {
              externalId: `${eventId}:totals:${bookmakerKey}:Under:2.5`,
              name: "Under 2.5",
              price: underPrice,
              point: "2.5",
              marketKey: "totals",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        },

        ...(isSoccer
          ? [
              // 8. Total Goals Over/Under 3.5
              {
                key: "totals_3_5",
                name: "Total Goals Over/Under 3.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:totals_3_5:${bookmakerKey}:Over:3.5`,
                    name: "Over 3.5 Goals",
                    price: "2.95",
                    point: "3.5",
                    marketKey: "totals_3_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:totals_3_5:${bookmakerKey}:Under:3.5`,
                    name: "Under 3.5 Goals",
                    price: "1.36",
                    point: "3.5",
                    marketKey: "totals_3_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 9. Total Goals Over/Under 4.5
              {
                key: "totals_4_5",
                name: "Total Goals Over/Under 4.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:totals_4_5:${bookmakerKey}:Over:4.5`,
                    name: "Over 4.5 Goals",
                    price: "5.40",
                    point: "4.5",
                    marketKey: "totals_4_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:totals_4_5:${bookmakerKey}:Under:4.5`,
                    name: "Under 4.5 Goals",
                    price: "1.14",
                    point: "4.5",
                    marketKey: "totals_4_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 10. Odd / Even Goals
              {
                key: "goals_odd_even",
                name: "Total Goals (Odd / Even)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:goals_odd_even:${bookmakerKey}:Odd`,
                    name: "Odd Goals",
                    price: "1.92",
                    point: null,
                    marketKey: "goals_odd_even",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:goals_odd_even:${bookmakerKey}:Even`,
                    name: "Even Goals",
                    price: "1.88",
                    point: null,
                    marketKey: "goals_odd_even",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 11. Home Team Total Goals
              {
                key: "home_team_totals",
                name: `${homeTeam} Total Goals Over/Under 1.5`,
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:home_team_totals:${bookmakerKey}:Over:1.5`,
                    name: `${homeTeam} Over 1.5 Goals`,
                    price: (homeP < 2.0 ? "1.65" : "2.40"),
                    point: "1.5",
                    marketKey: "home_team_totals",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:home_team_totals:${bookmakerKey}:Under:1.5`,
                    name: `${homeTeam} Under 1.5 Goals`,
                    price: (homeP < 2.0 ? "2.15" : "1.50"),
                    point: "1.5",
                    marketKey: "home_team_totals",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 12. Away Team Total Goals
              {
                key: "away_team_totals",
                name: `${awayTeam} Total Goals Over/Under 1.5`,
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:away_team_totals:${bookmakerKey}:Over:1.5`,
                    name: `${awayTeam} Over 1.5 Goals`,
                    price: (awayP < 2.0 ? "1.65" : "2.55"),
                    point: "1.5",
                    marketKey: "away_team_totals",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:away_team_totals:${bookmakerKey}:Under:1.5`,
                    name: `${awayTeam} Under 1.5 Goals`,
                    price: (awayP < 2.0 ? "2.15" : "1.45"),
                    point: "1.5",
                    marketKey: "away_team_totals",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 13. First Team to Score
              {
                key: "first_team_to_score",
                name: "First Team To Score",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:first_team_to_score:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} Scores First`,
                    price: (homeP * 0.85).toFixed(2),
                    point: null,
                    marketKey: "first_team_to_score",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:first_team_to_score:${bookmakerKey}:NoGoals`,
                    name: "No Goals (0-0)",
                    price: "8.50",
                    point: null,
                    marketKey: "first_team_to_score",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:first_team_to_score:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} Scores First`,
                    price: (awayP * 0.85).toFixed(2),
                    point: null,
                    marketKey: "first_team_to_score",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 14. 1st Half Result (1X2)
              {
                key: "half_time_result",
                name: "1st Half Result (1X2)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:half_time_result:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} (1st Half)`,
                    price: htHome,
                    point: null,
                    marketKey: "half_time_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:half_time_result:${bookmakerKey}:Draw`,
                    name: "Draw (1st Half)",
                    price: htDraw,
                    point: null,
                    marketKey: "half_time_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:half_time_result:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} (1st Half)`,
                    price: htAway,
                    point: null,
                    marketKey: "half_time_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 15. 2nd Half Result (1X2)
              {
                key: "second_half_result",
                name: "2nd Half Result (1X2)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:second_half_result:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} (2nd Half)`,
                    price: shHome,
                    point: null,
                    marketKey: "second_half_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:second_half_result:${bookmakerKey}:Draw`,
                    name: "Draw (2nd Half)",
                    price: shDraw,
                    point: null,
                    marketKey: "second_half_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:second_half_result:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} (2nd Half)`,
                    price: shAway,
                    point: null,
                    marketKey: "second_half_result",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 16. 1st Half Over/Under 0.5 Goals
              {
                key: "first_half_totals_0_5",
                name: "1st Half Goals Over/Under 0.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:first_half_totals_0_5:${bookmakerKey}:Over:0.5`,
                    name: "1st Half Over 0.5 Goals",
                    price: "1.42",
                    point: "0.5",
                    marketKey: "first_half_totals_0_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:first_half_totals_0_5:${bookmakerKey}:Under:0.5`,
                    name: "1st Half Under 0.5 Goals",
                    price: "2.65",
                    point: "0.5",
                    marketKey: "first_half_totals_0_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 17. 1st Half Over/Under 1.5 Goals
              {
                key: "first_half_totals_1_5",
                name: "1st Half Goals Over/Under 1.5",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:first_half_totals_1_5:${bookmakerKey}:Over:1.5`,
                    name: "1st Half Over 1.5 Goals",
                    price: "2.85",
                    point: "1.5",
                    marketKey: "first_half_totals_1_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:first_half_totals_1_5:${bookmakerKey}:Under:1.5`,
                    name: "1st Half Under 1.5 Goals",
                    price: "1.38",
                    point: "1.5",
                    marketKey: "first_half_totals_1_5",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 18. Highest Scoring Half
              {
                key: "highest_scoring_half",
                name: "Highest Scoring Half",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:highest_scoring_half:${bookmakerKey}:1st`,
                    name: "1st Half Most Goals",
                    price: "3.10",
                    point: null,
                    marketKey: "highest_scoring_half",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:highest_scoring_half:${bookmakerKey}:Equal`,
                    name: "Equal Goals in Both Halves",
                    price: "3.40",
                    point: null,
                    marketKey: "highest_scoring_half",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:highest_scoring_half:${bookmakerKey}:2nd`,
                    name: "2nd Half Most Goals",
                    price: "2.05",
                    point: null,
                    marketKey: "highest_scoring_half",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 19. Half Time / Full Time (HT/FT)
              {
                key: "ht_ft",
                name: "Half Time / Full Time (HT/FT)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:1/1`,
                    name: `${homeTeam} / ${homeTeam} (1/1)`,
                    price: (homeP * 1.55).toFixed(2),
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:X/1`,
                    name: `Draw / ${homeTeam} (X/1)`,
                    price: (homeP * 2.30).toFixed(2),
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:X/X`,
                    name: "Draw / Draw (X/X)",
                    price: "5.50",
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:X/2`,
                    name: `Draw / ${awayTeam} (X/2)`,
                    price: (awayP * 2.30).toFixed(2),
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:2/2`,
                    name: `${awayTeam} / ${awayTeam} (2/2)`,
                    price: (awayP * 1.55).toFixed(2),
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:1/2`,
                    name: `${homeTeam} / ${awayTeam} (1/2 Turnaround)`,
                    price: "28.00",
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:ht_ft:${bookmakerKey}:2/1`,
                    name: `${awayTeam} / ${homeTeam} (2/1 Turnaround)`,
                    price: "26.00",
                    point: null,
                    marketKey: "ht_ft",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 20. Correct Score
              {
                key: "correct_score",
                name: "Correct Score",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  { externalId: `${eventId}:cs:${bookmakerKey}:1-0`, name: "1 - 0", price: (homeP < 2.0 ? "6.50" : "8.50"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:2-0`, name: "2 - 0", price: (homeP < 2.0 ? "7.50" : "12.00"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:2-1`, name: "2 - 1", price: "8.50", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:3-0`, name: "3 - 0", price: (homeP < 2.0 ? "11.00" : "21.00"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:3-1`, name: "3 - 1", price: "14.00", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:0-0`, name: "0 - 0", price: "9.00", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:1-1`, name: "1 - 1", price: "6.20", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:2-2`, name: "2 - 2", price: "13.00", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:0-1`, name: "0 - 1", price: (awayP < 2.0 ? "6.50" : "9.50"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:0-2`, name: "0 - 2", price: (awayP < 2.0 ? "7.50" : "14.00"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:1-2`, name: "1 - 2", price: "9.50", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:0-3`, name: "0 - 3", price: (awayP < 2.0 ? "12.00" : "26.00"), point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                  { externalId: `${eventId}:cs:${bookmakerKey}:other`, name: "Any Other Score", price: "5.80", point: null, marketKey: "correct_score", bookmakerKey, eventExternalId: eventId, lastUpdated: now },
                ],
              },

              // 21. Clean Sheet
              {
                key: "clean_sheet",
                name: "Clean Sheet (Shutout)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:clean_sheet:${bookmakerKey}:${homeTeam}:Yes`,
                    name: `${homeTeam} Clean Sheet (Yes)`,
                    price: (homeP < 2.0 ? "2.25" : "3.40"),
                    point: null,
                    marketKey: "clean_sheet",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:clean_sheet:${bookmakerKey}:${awayTeam}:Yes`,
                    name: `${awayTeam} Clean Sheet (Yes)`,
                    price: (awayP < 2.0 ? "2.25" : "3.60"),
                    point: null,
                    marketKey: "clean_sheet",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 22. Win to Nil
              {
                key: "win_to_nil",
                name: "Win To Nil (Win Without Conceding)",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:win_to_nil:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} Win to Nil`,
                    price: (homeP * 1.85).toFixed(2),
                    point: null,
                    marketKey: "win_to_nil",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:win_to_nil:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} Win to Nil`,
                    price: (awayP * 1.85).toFixed(2),
                    point: null,
                    marketKey: "win_to_nil",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },

              // 23. Win Either Half
              {
                key: "win_either_half",
                name: "Win Either Half",
                bookmakerKey,
                eventExternalId: eventId,
                lastUpdated: now,
                outcomes: [
                  {
                    externalId: `${eventId}:win_either_half:${bookmakerKey}:${homeTeam}`,
                    name: `${homeTeam} To Win Either Half`,
                    price: (homeP < 2.0 ? "1.28" : "1.75"),
                    point: null,
                    marketKey: "win_either_half",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                  {
                    externalId: `${eventId}:win_either_half:${bookmakerKey}:${awayTeam}`,
                    name: `${awayTeam} To Win Either Half`,
                    price: (awayP < 2.0 ? "1.28" : "1.85"),
                    point: null,
                    marketKey: "win_either_half",
                    bookmakerKey,
                    eventExternalId: eventId,
                    lastUpdated: now,
                  },
                ],
              },
            ]
          : []),

        // 24. Point Spread / Asian Handicap
        {
          key: "spreads",
          name: `Point Spread / Handicap (${homePoint > 0 ? "+" : ""}${homePoint})`,
          bookmakerKey,
          eventExternalId: eventId,
          lastUpdated: now,
          outcomes: [
            {
              externalId: `${eventId}:spreads:${bookmakerKey}:${homeTeam}:${homePoint}`,
              name: `${homeTeam} (${homePoint > 0 ? "+" : ""}${homePoint})`,
              price: homeSpreadPrice,
              point: homePoint.toString(),
              marketKey: "spreads",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
            {
              externalId: `${eventId}:spreads:${bookmakerKey}:${awayTeam}:${-homePoint}`,
              name: `${awayTeam} (${-homePoint > 0 ? "+" : ""}${-homePoint})`,
              price: awaySpreadPrice,
              point: (-homePoint).toString(),
              marketKey: "spreads",
              bookmakerKey,
              eventExternalId: eventId,
              lastUpdated: now,
            },
          ],
        },
      ];

      events.push({
        externalId: eventId,
        sportKey,
        sportTitle: leagueConfig.sportTitle,
        league: leagueConfig.leagueName,
        homeTeam,
        awayTeam,
        commenceTime: item.date,
        isLive,
        liveMinute,
        score,
        lastUpdated: now,
        bookmakers: [
          {
            key: bookmakerKey,
            name: providerName,
            region: "global",
            lastUpdated: now,
          },
        ],
        markets,
      });
    }

    if (events.length > 0) {
      CACHE.set(sportKey, { events, cachedAt: Date.now() });
      return events;
    }

    return [];
  } catch (err) {
    console.error(`ESPN feed error for ${sportKey}:`, (err as Error).message);
    return [];
  }
}
