type ValidResult = { valid: true; value: string };
type InvalidResult = { valid: false; reason: string };
type QueryResult = ValidResult | InvalidResult;

// Allowlist kept as defense-in-depth only: every consumer of the validated
// value already encodes it (encodeURIComponent in the scrapers, URLSearchParams
// in the VTEX helpers, SHA256 in the cache keys). The characters below are the
// ones real product searches need — `"` for inches ("samsung 65\""), `/` for
// "i5/i7", `&` for brand pairs. Structural characters (< > \ ` ; $ {}) and line
// breaks stay out.
const ALLOWED_CHARS = /^[\p{L}\p{N} \-_.,()"'\/+&]+$/u;

export function validateQuery(input: unknown): QueryResult {
  if (typeof input !== "string") {
    return { valid: false, reason: "Query must be a string" };
  }
  if (input.length > 100) {
    return {
      valid: false,
      reason: "Query exceeds maximum length of 100 characters",
    };
  }
  if (/\r|\n/.test(input)) {
    return {
      valid: false,
      reason: "Query contains invalid line break characters",
    };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "Query cannot be empty" };
  }
  if (!ALLOWED_CHARS.test(trimmed)) {
    return { valid: false, reason: "Query contains disallowed characters" };
  }
  return { valid: true, value: trimmed };
}
