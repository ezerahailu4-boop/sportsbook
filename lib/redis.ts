import Redis from "ioredis";

// Memory cache fallback when Redis is not available
const memoryStore = new Map<string, { value: string; expiresAt: number | null }>();

class FallbackCache {
  async get(key: string): Promise<string | null> {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt !== null && item.expiresAt < Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<"OK"> {
    let expiresAt: number | null = null;
    if (mode === "EX" && duration) {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === "PX" && duration) {
      expiresAt = Date.now() + duration;
    }
    memoryStore.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    return memoryStore.delete(key) ? 1 : 0;
  }

  async flushall(): Promise<"OK"> {
    memoryStore.clear();
    return "OK";
  }
}

let redisInstance: Redis | FallbackCache;

if (process.env.REDIS_URL) {
  try {
    const r = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry if initial connection fails, use fallback
    });

    r.on("error", (err) => {
      // Avoid unhandled rejection logs in demo mode
    });

    redisInstance = r;
  } catch {
    redisInstance = new FallbackCache();
  }
} else {
  redisInstance = new FallbackCache();
}

export const redis = redisInstance;
