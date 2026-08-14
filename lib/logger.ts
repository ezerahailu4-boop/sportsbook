export type LogLevel = "info" | "warn" | "error" | "debug";

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...(context ? { context } : {}),
  };

  const str = JSON.stringify(payload);
  switch (level) {
    case "error":
      console.error(str);
      break;
    case "warn":
      console.warn(str);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(str);
      break;
    default:
      console.log(str);
  }
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
};
