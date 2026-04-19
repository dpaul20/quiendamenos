type ValidResult = { valid: true; value: string };
type InvalidResult = { valid: false; reason: string };
type QueryResult = ValidResult | InvalidResult;

const ALLOWED_CHARS = /^[\p{L}\p{N} \-_.,()]+$/u;

export function validateQuery(input: unknown): QueryResult {
  if (typeof input !== 'string') {
    return { valid: false, reason: 'Query must be a string' };
  }
  if (input.length > 100) {
    return { valid: false, reason: 'Query exceeds maximum length of 100 characters' };
  }
  if (/\r|\n/.test(input)) {
    return { valid: false, reason: 'Query contains invalid line break characters' };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: 'Query cannot be empty' };
  }
  if (!ALLOWED_CHARS.test(trimmed)) {
    return { valid: false, reason: 'Query contains disallowed characters' };
  }
  return { valid: true, value: trimmed };
}
