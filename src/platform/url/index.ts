const FORBIDDEN_SCHEMES = new Set(['javascript:', 'data:', 'file:']);

export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Unsafe URL: forbidden scheme');
  }
  const parsed = new URL(input);
  if (FORBIDDEN_SCHEMES.has(parsed.protocol.toLowerCase())) {
    throw new Error('Unsafe URL: forbidden scheme');
  }
  return input;
}
