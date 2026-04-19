import { sanitizeUrl } from '@/platform/url';

describe('sanitizeUrl', () => {
  it('returns https URL string unchanged', () => {
    const url = 'https://www.carrefour.com.ar/path';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('returns http URL string unchanged', () => {
    const url = 'http://example.com';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('throws on javascript: scheme', () => {
    expect(() => sanitizeUrl('javascript:alert(1)')).toThrow('Unsafe URL: forbidden scheme');
  });

  it('throws on JAVASCRIPT: scheme (case-insensitive)', () => {
    expect(() => sanitizeUrl('JAVASCRIPT:alert(1)')).toThrow('Unsafe URL: forbidden scheme');
  });

  it('throws on data: scheme', () => {
    expect(() => sanitizeUrl('data:text/html,<h1>x</h1>')).toThrow('Unsafe URL: forbidden scheme');
  });

  it('throws on file: scheme', () => {
    expect(() => sanitizeUrl('file:///etc/passwd')).toThrow('Unsafe URL: forbidden scheme');
  });

  it('throws on malformed URL', () => {
    expect(() => sanitizeUrl('not a url')).toThrow();
  });

  it('throws on non-string input', () => {
    expect(() => sanitizeUrl(42)).toThrow();
  });
});
