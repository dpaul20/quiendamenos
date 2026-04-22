jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));

function loadRedis(): Promise<void> {
  return new Promise((resolve, reject) => {
    jest.isolateModules(() => {
      try {
        require('@/platform/redis');
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

type MutableEnv = Record<string, string | undefined>;

describe('Redis fail-fast in production', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws when NODE_ENV=production and UPSTASH_REDIS_REST_TOKEN is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'production';
    delete (process.env as MutableEnv).UPSTASH_REDIS_REST_TOKEN;
    await expect(loadRedis()).rejects.toThrow(/UPSTASH_REDIS_REST_TOKEN/);
  });

  it('does NOT throw when NODE_ENV=production and UPSTASH_REDIS_REST_TOKEN is set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'production';
    (process.env as MutableEnv).UPSTASH_REDIS_REST_TOKEN = 's3cr3t';
    (process.env as MutableEnv).UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    await expect(loadRedis()).resolves.toBeUndefined();
  });

  it('does NOT throw when NODE_ENV=development and UPSTASH_REDIS_REST_TOKEN is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'development';
    delete (process.env as MutableEnv).UPSTASH_REDIS_REST_TOKEN;
    await expect(loadRedis()).resolves.toBeUndefined();
  });

  it('does NOT throw when NODE_ENV=test and UPSTASH_REDIS_REST_TOKEN is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'test';
    delete (process.env as MutableEnv).UPSTASH_REDIS_REST_TOKEN;
    await expect(loadRedis()).resolves.toBeUndefined();
  });
});
