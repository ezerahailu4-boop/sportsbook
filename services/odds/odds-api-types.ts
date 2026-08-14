// Types matching The Odds API v4 official response shapes.
// https://the-odds-api.com/liveapi/guides/v4/ — do not invent fields.

export interface OddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface OddsApiMarket {
  key: string; // h2h | spreads | totals | h2h_3_way | btts | draw_no_bet | ...
  last_update: string; // ISO timestamp
  outcomes: OddsApiOutcome[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiEventSummary {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
}

export interface OddsApiRequestParams {
  regions?: string; // e.g. "eu,uk,us"
  markets?: string; // e.g. "h2h,spreads,totals"
  oddsFormat?: "decimal" | "american";
  bookmakers?: string;
  commenceTimeFrom?: string;
  commenceTimeTo?: string;
}
