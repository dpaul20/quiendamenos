import { validateQuery } from '@/platform/query';

describe('validateQuery', () => {
  it('accepts "Samsung TV 55"', () => {
    const result = validateQuery('Samsung TV 55');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe('Samsung TV 55');
  });

  it('rejects a 101-character string (max length exceeded)', () => {
    const input = 'a'.repeat(101);
    const result = validateQuery(input);
    expect(result.valid).toBe(false);
  });

  it('rejects string with carriage return \\r', () => {
    const result = validateQuery('samsung\rTV');
    expect(result.valid).toBe(false);
  });

  it('rejects string with newline \\n', () => {
    const result = validateQuery('samsung\nTV');
    expect(result.valid).toBe(false);
  });

  it('rejects string with disallowed chars like <script>', () => {
    const result = validateQuery('tv <script>');
    expect(result.valid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateQuery('');
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    const result = validateQuery('   ');
    expect(result.valid).toBe(false);
  });

  it('accepts Spanish characters like "televisión"', () => {
    const result = validateQuery('televisión');
    expect(result.valid).toBe(true);
  });

  it('returns trimmed value on success', () => {
    const result = validateQuery('  Samsung TV  ');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe('Samsung TV');
  });

  it('rejects non-string input', () => {
    const result = validateQuery(42);
    expect(result.valid).toBe(false);
  });

  it('accepts allowed special chars: - _ . , ( )', () => {
    const result = validateQuery('TV LED (Samsung), 4K-UHD_2024.');
    expect(result.valid).toBe(true);
  });
});
