jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }));
});

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

  it('throws when NODE_ENV=production and REDIS_PASSWORD is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'production';
    delete (process.env as MutableEnv).REDIS_PASSWORD;
    await expect(loadRedis()).rejects.toThrow(/REDIS_PASSWORD/);
  });

  it('throws when NODE_ENV=production and REDIS_PASSWORD is empty string', async () => {
    (process.env as MutableEnv).NODE_ENV = 'production';
    (process.env as MutableEnv).REDIS_PASSWORD = '';
    await expect(loadRedis()).rejects.toThrow(/REDIS_PASSWORD/);
  });

  it('does NOT throw when NODE_ENV=production and REDIS_PASSWORD is set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'production';
    (process.env as MutableEnv).REDIS_PASSWORD = 's3cr3t';
    await expect(loadRedis()).resolves.toBeUndefined();
  });

  it('does NOT throw when NODE_ENV=development and REDIS_PASSWORD is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'development';
    delete (process.env as MutableEnv).REDIS_PASSWORD;
    await expect(loadRedis()).resolves.toBeUndefined();
  });

  it('does NOT throw when NODE_ENV=test and REDIS_PASSWORD is not set', async () => {
    (process.env as MutableEnv).NODE_ENV = 'test';
    delete (process.env as MutableEnv).REDIS_PASSWORD;
    await expect(loadRedis()).resolves.toBeUndefined();
  });
});
