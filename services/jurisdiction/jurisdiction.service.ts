export interface JurisdictionCheckResult {
  allowed: boolean;
  countryCode?: string;
  reason?: string;
}

// Configurable allowed / restricted territories
const ALLOWED_COUNTRIES = process.env.ALLOWED_COUNTRIES
  ? new Set(process.env.ALLOWED_COUNTRIES.split(",").map((c) => c.trim().toUpperCase()))
  : new Set(["ET"]); // Default allowed licensed market: Ethiopia (ET)

const RESTRICTED_COUNTRIES = new Set<string>([
  "US", "GB", "FR", "ES", "IT", "DE" // Example restricted non-licensed territories
]);

export function checkJurisdiction(country: string): JurisdictionCheckResult {
  const code = country.toUpperCase();

  // If specific ALLOWED_COUNTRIES is defined, require presence in whitelist
  if (ALLOWED_COUNTRIES.size > 0 && !ALLOWED_COUNTRIES.has(code)) {
    return {
      allowed: false,
      countryCode: code,
      reason: `Sports wagering is not licensed in your region (${code}).`,
    };
  }

  if (RESTRICTED_COUNTRIES.has(code)) {
    return {
      allowed: false,
      countryCode: code,
      reason: "Betting is restricted in your region.",
    };
  }

  return { allowed: true, countryCode: code };
}

// Inspects incoming request headers (e.g. Cloudflare CF-IPCountry header, AWS CloudFront, or X-Country-Code)
export function extractCountryFromHeaders(headers: Headers): string {
  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") return cfCountry.toUpperCase();

  const xCountry = headers.get("x-country-code");
  if (xCountry) return xCountry.toUpperCase();

  // In development fallback to ET
  return "ET";
}

export function getAllowedCountries(): Array<{ code: string; name: string }> {
  const countryNameMap: Record<string, string> = {
    ET: "Ethiopia",
    KE: "Kenya",
    NG: "Nigeria",
    GH: "Ghana",
    UG: "Uganda",
    TZ: "Tanzania",
    RW: "Rwanda",
    ZA: "South Africa",
  };

  return Array.from(ALLOWED_COUNTRIES).map((code) => ({
    code,
    name: countryNameMap[code] || code,
  }));
}

