export interface SportCategory {
  key: string;
  name: string;
  sport: string;
  sportGroup: "Football" | "Basketball" | "Tennis" | "American Sports" | "Combat Sports" | "Winter & Ice" | "Cricket & Rugby";
  flag: string;
  country: string;
  count: number;
  isPopular?: boolean;
}

export interface SportGroup {
  name: string;
  iconName: string;
  flag: string;
  leagues: SportCategory[];
}

export const SPORTS_CATEGORIES: SportCategory[] = [
  // Football / Soccer
  { key: "soccer_epl", name: "Premier League", sport: "Football", sportGroup: "Football", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "England", count: 10, isPopular: true },
  { key: "soccer_spain_la_liga", name: "La Liga", sport: "Football", sportGroup: "Football", flag: "🇪🇸", country: "Spain", count: 10, isPopular: true },
  { key: "soccer_uefa_champs_league", name: "Champions League", sport: "Football", sportGroup: "Football", flag: "🇪🇺", country: "Europe", count: 16, isPopular: true },
  { key: "soccer_germany_bundesliga", name: "Bundesliga", sport: "Football", sportGroup: "Football", flag: "🇩🇪", country: "Germany", count: 9, isPopular: true },
  { key: "soccer_italy_serie_a", name: "Serie A", sport: "Football", sportGroup: "Football", flag: "🇮🇹", country: "Italy", count: 10, isPopular: true },
  { key: "soccer_france_ligue_one", name: "Ligue 1", sport: "Football", sportGroup: "Football", flag: "🇫🇷", country: "France", count: 9, isPopular: true },
  { key: "soccer_uefa_europa_league", name: "Europa League", sport: "Football", sportGroup: "Football", flag: "🇪🇺", country: "Europe", count: 12 },
  { key: "soccer_usa_mls", name: "MLS", sport: "Football", sportGroup: "Football", flag: "🇺🇸", country: "USA", count: 14 },
  { key: "soccer_saudi_arabia_pro_league", name: "Saudi Pro League", sport: "Football", sportGroup: "Football", flag: "🇸🇦", country: "Saudi Arabia", count: 8 },
  { key: "soccer_netherlands_eredivisie", name: "Eredivisie", sport: "Football", sportGroup: "Football", flag: "🇳🇱", country: "Netherlands", count: 9 },

  // Basketball
  { key: "basketball_nba", name: "NBA", sport: "Basketball", sportGroup: "Basketball", flag: "🏀", country: "USA", count: 12, isPopular: true },
  { key: "basketball_euroleague", name: "EuroLeague", sport: "Basketball", sportGroup: "Basketball", flag: "🇪🇺", country: "Europe", count: 8, isPopular: true },
  { key: "basketball_ncaab", name: "NCAA College Basketball", sport: "Basketball", sportGroup: "Basketball", flag: "🇺🇸", country: "USA", count: 15 },
  { key: "basketball_nbl", name: "NBL Australia", sport: "Basketball", sportGroup: "Basketball", flag: "🇦🇺", country: "Australia", count: 5 },

  // Tennis
  { key: "tennis_atp", name: "ATP Men's Tour", sport: "Tennis", sportGroup: "Tennis", flag: "🎾", country: "International", count: 14, isPopular: true },
  { key: "tennis_wta", name: "WTA Women's Tour", sport: "Tennis", sportGroup: "Tennis", flag: "🎾", country: "International", count: 12, isPopular: true },

  // American Sports & Baseball
  { key: "americanfootball_nfl", name: "NFL Football", sport: "American Football", sportGroup: "American Sports", flag: "🏈", country: "USA", count: 8, isPopular: true },
  { key: "baseball_mlb", name: "MLB Baseball", sport: "Baseball", sportGroup: "American Sports", flag: "⚾", country: "USA", count: 15, isPopular: true },

  // Ice Hockey
  { key: "icehockey_nhl", name: "NHL Ice Hockey", sport: "Ice Hockey", sportGroup: "Winter & Ice", flag: "🏒", country: "USA / Canada", count: 10, isPopular: true },

  // Combat Sports
  { key: "mma_mixed_martial_arts", name: "UFC / MMA", sport: "Combat Sports", sportGroup: "Combat Sports", flag: "🥊", country: "International", count: 6, isPopular: true },
  { key: "boxing_boxing", name: "Championship Boxing", sport: "Combat Sports", sportGroup: "Combat Sports", flag: "🥊", country: "International", count: 4 },

  // Cricket & Rugby
  { key: "cricket_ipl", name: "IPL / T20 Cricket", sport: "Cricket", sportGroup: "Cricket & Rugby", flag: "🏏", country: "International", count: 6 },
  { key: "rugby_six_nations", name: "Six Nations Rugby", sport: "Rugby", sportGroup: "Cricket & Rugby", flag: "🏉", country: "International", count: 4 },
];

export const POPULAR_LEAGUES = SPORTS_CATEGORIES.filter((c) => c.isPopular);

export const ALL_SPORT_GROUPS: { group: string; flag: string; count: number }[] = [
  { group: "Football", flag: "⚽", count: 98 },
  { group: "Basketball", flag: "🏀", count: 40 },
  { group: "Tennis", flag: "🎾", count: 26 },
  { group: "American Sports", flag: "🏈", count: 23 },
  { group: "Winter & Ice", flag: "🏒", count: 10 },
  { group: "Combat Sports", flag: "🥊", count: 10 },
  { group: "Cricket & Rugby", flag: "🏏", count: 10 },
];
