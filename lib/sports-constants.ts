export interface SportCategory {
  key: string;
  name: string;
  sport: string;
  flag: string;
  count: number;
}

export const SPORTS_CATEGORIES: SportCategory[] = [
  { key: "soccer_epl", name: "Premier League", sport: "Football", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 10 },
  { key: "soccer_spain_la_liga", name: "La Liga", sport: "Football", flag: "🇪🇸", count: 8 },
  { key: "soccer_uefa_champs_league", name: "Champions League", sport: "Football", flag: "🇪🇺", count: 16 },
  { key: "basketball_nba", name: "NBA Basketball", sport: "Basketball", flag: "🏀", count: 12 },
  { key: "tennis_atp", name: "ATP World Tour", sport: "Tennis", flag: "🎾", count: 14 },
  { key: "mma_mixed_martial_arts", name: "UFC / MMA", sport: "Fighting", flag: "🥊", count: 6 },
  { key: "americanfootball_nfl", name: "NFL Football", sport: "American Football", flag: "🏈", count: 8 },
];
