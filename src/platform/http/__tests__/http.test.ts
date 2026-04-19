import { createHttpClient, httpClient } from '@/platform/http';

describe('createHttpClient', () => {
  it('returns an instance with default timeout of 23000ms', () => {
    const client = createHttpClient();
    expect(client.defaults.timeout).toBe(23000);
  });

  it('returns an instance with custom timeout = connectTimeout + responseTimeout', () => {
    const client = createHttpClient({ connectTimeout: 3000, responseTimeout: 5000 });
    expect(client.defaults.timeout).toBe(8000);
  });

  it('exported httpClient singleton has the correct default timeout', () => {
    expect(httpClient.defaults.timeout).toBe(23000);
  });
});
