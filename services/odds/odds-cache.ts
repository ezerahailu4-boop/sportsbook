import Redis from "ioredis";
import type { NormalizedEvent } from "./odds-normalizer";

const SPORTS_TTL_SECONDS = 3600; // sport list changes rarely
const EVENTS_TTL_SECONDS = 30; // odds move fast; keep this short

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) redisClient = new Redis(process.env.REDIS_URL);
  return redisClient;
}

function eventsKey(sportKey: string): string {
  return `odds:events:${sportKey}`;
}

function sportsKey(): string {
  return "odds:sports";
}

export async function cacheEvents(sportKey: string, events: NormalizedEvent[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return; // no Redis configured — caller falls back to DB/DEMO MODE
  await redis.set(eventsKey(sportKey), JSON.stringify(events), "EX", EVENTS_TTL_SECONDS);
}

export async function getCachedEvents(sportKey: string): Promise<NormalizedEvent[] | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get(eventsKey(sportKey));
  return raw ? (JSON.parse(raw) as NormalizedEvent[]) : null;
}

export async function cacheSports(sports: unknown[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(sportsKey(), JSON.stringify(sports), "EX", SPORTS_TTL_SECONDS);
}

export async function getCachedSports<T>(): Promise<T[] | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get(sportsKey());
  return raw ? (JSON.parse(raw) as T[]) : null;
}

// Every cached odds response must expose how old it is — spec section 8.
// Callers compute "Updated N seconds ago" in the UI from this timestamp,
// never from wall-clock assumptions about the cache TTL.
export function ageInSeconds(lastUpdated: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000));
}
