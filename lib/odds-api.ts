// Server-side only. Never import this from client components — the API key
// must never reach the browser. All routes that need odds data go through
// services/odds/odds.service.ts, which calls this client from the server.
import type {
  OddsApiSport,
  OddsApiEvent,
  OddsApiEventSummary,
  OddsApiRequestParams,
} from "@/services/odds/odds-api-types";

const BASE_URL = "https://api.the-odds-api.com";
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

export class OddsApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "RATE_LIMITED" | "SERVER_ERROR" | "MALFORMED" | "UNKNOWN"
  ) {
    super(message);
    this.name = "OddsApiError";
  }
}

function getApiKey(): string {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    throw new Error("ODDS_API_KEY not set — the odds service should fall back to demo mode before calling this client.");
  }
  return key;
}

function classifyStatus(status: number): OddsApiError["code"] {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      const code = classifyStatus(res.status);
      const retryable = code === "RATE_LIMITED" || code === "SERVER_ERROR";
      if (retryable && attempt < MAX_RETRIES) {
        const backoffMs = 2 ** attempt * 500;
        await new Promise((r) => setTimeout(r, backoffMs));
        return fetchWithRetry(url, attempt + 1);
      }
      throw new OddsApiError(`The Odds API request failed with status ${res.status}`, res.status, code);
    }

    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof OddsApiError) throw err;
    if (attempt < MAX_RETRIES) {
      const backoffMs = 2 ** attempt * 500;
      await new Promise((r) => setTimeout(r, backoffMs));
      return fetchWithRetry(url, attempt + 1);
    }
    throw new OddsApiError(`The Odds API request failed: ${(err as Error).message}`, 0, "SERVER_ERROR");
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    throw new OddsApiError("The Odds API returned a malformed response", res.status, "MALFORMED");
  }
}

function buildQuery(params: OddsApiRequestParams = {}): string {
  const q = new URLSearchParams();
  q.set("apiKey", getApiKey());
  if (params.regions) q.set("regions", params.regions);
  if (params.markets) q.set("markets", params.markets);
  q.set("oddsFormat", params.oddsFormat ?? "decimal");
  if (params.bookmakers) q.set("bookmakers", params.bookmakers);
  if (params.commenceTimeFrom) q.set("commenceTimeFrom", params.commenceTimeFrom);
  if (params.commenceTimeTo) q.set("commenceTimeTo", params.commenceTimeTo);
  return q.toString();
}

export async function fetchSports(): Promise<OddsApiSport[]> {
  const res = await fetchWithRetry(`${BASE_URL}/v4/sports/?apiKey=${getApiKey()}`);
  return parseJson<OddsApiSport[]>(res);
}

export async function fetchOdds(sportKey: string, params: OddsApiRequestParams = {}): Promise<OddsApiEvent[]> {
  const query = buildQuery(params);
  const res = await fetchWithRetry(`${BASE_URL}/v4/sports/${sportKey}/odds/?${query}`);
  return parseJson<OddsApiEvent[]>(res);
}

export async function fetchEvents(sportKey: string, params: OddsApiRequestParams = {}): Promise<OddsApiEventSummary[]> {
  const query = buildQuery(params);
  const res = await fetchWithRetry(`${BASE_URL}/v4/sports/${sportKey}/events/?${query}`);
  return parseJson<OddsApiEventSummary[]>(res);
}

export async function fetchEventOdds(
  sportKey: string,
  eventId: string,
  params: OddsApiRequestParams = {}
): Promise<OddsApiEvent> {
  const query = buildQuery(params);
  const res = await fetchWithRetry(`${BASE_URL}/v4/sports/${sportKey}/events/${eventId}/odds/?${query}`);
  return parseJson<OddsApiEvent>(res);
}
