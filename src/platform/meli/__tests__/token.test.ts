import {
  getMeliAccessToken,
  invalidateMeliToken,
  MeliAuthError,
  MELI_TOKEN_CACHE_KEY,
} from "../token";

jest.mock("@/platform/http", () => ({
  httpClient: { post: jest.fn() },
}));

jest.mock("@/platform/redis", () => ({
  __esModule: true,
  default: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
}));

import { httpClient } from "@/platform/http";
import redis from "@/platform/redis";

const mockPost = httpClient.post as jest.Mock;
const mockRedisGet = redis.get as jest.Mock;
const mockRedisSet = redis.set as jest.Mock;
const mockRedisDel = redis.del as jest.Mock;

const tokenResponse = (token = "APP_USR-token-abc", expiresIn = 21600) => ({
  data: { access_token: token, token_type: "bearer", expires_in: expiresIn },
});

const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  invalidateMeliToken();
  process.env = {
    ...originalEnv,
    MELI_CLIENT_ID: "1234567890",
    MELI_CLIENT_SECRET: "client-secret-value",
  };
  mockRedisGet.mockResolvedValue(null);
  mockRedisSet.mockResolvedValue("OK");
  mockRedisDel.mockResolvedValue(1);
});

afterEach(() => {
  process.env = originalEnv;
  invalidateMeliToken();
});

describe("getMeliAccessToken — obtaining a token", () => {
  it("requests a token with the client_credentials grant", async () => {
    mockPost.mockResolvedValue(tokenResponse());

    const token = await getMeliAccessToken();

    expect(token).toBe("APP_USR-token-abc");
    expect(mockPost).toHaveBeenCalledTimes(1);

    const [url, body, config] = mockPost.mock.calls[0];
    expect(url).toBe("https://api.mercadolibre.com/oauth/token");
    expect(config.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );

    const params = new URLSearchParams(body as string);
    expect(params.get("grant_type")).toBe("client_credentials");
    expect(params.get("client_id")).toBe("1234567890");
    expect(params.get("client_secret")).toBe("client-secret-value");
  });

  it("throws a clear error when credentials are not configured", async () => {
    process.env = { ...originalEnv };
    delete process.env.MELI_CLIENT_ID;
    delete process.env.MELI_CLIENT_SECRET;

    await expect(getMeliAccessToken()).rejects.toBeInstanceOf(MeliAuthError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("marks the missing-credentials error as non-retriable", async () => {
    process.env = { ...originalEnv };
    delete process.env.MELI_CLIENT_ID;
    delete process.env.MELI_CLIENT_SECRET;

    const error = await getMeliAccessToken().catch((e: MeliAuthError) => e);

    expect((error as MeliAuthError).retriable).toBe(false);
  });

  it("keeps a failed token request retriable — it may be transient", async () => {
    mockPost.mockRejectedValue(new Error("gateway timeout"));

    const error = await getMeliAccessToken().catch((e: MeliAuthError) => e);

    expect((error as MeliAuthError).retriable).toBe(true);
  });

  it("does not leak the client secret in the thrown error", async () => {
    mockPost.mockRejectedValue(new Error("invalid_client"));

    await expect(getMeliAccessToken()).rejects.toThrow();

    const thrown = await getMeliAccessToken().catch((e: Error) => e.message);
    expect(thrown).not.toContain("client-secret-value");
  });
});

describe("getMeliAccessToken — caching", () => {
  it("reuses the in-memory token instead of requesting a new one", async () => {
    mockPost.mockResolvedValue(tokenResponse());

    await getMeliAccessToken();
    await getMeliAccessToken();

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("persists the token in Redis with a TTL below the real expiry", async () => {
    mockPost.mockResolvedValue(tokenResponse("APP_USR-token-abc", 21600));

    await getMeliAccessToken();

    expect(mockRedisSet).toHaveBeenCalledWith(
      MELI_TOKEN_CACHE_KEY,
      "APP_USR-token-abc",
      expect.objectContaining({ ex: expect.any(Number) }),
    );
    const { ex } = mockRedisSet.mock.calls[0][2] as { ex: number };
    expect(ex).toBeLessThan(21600);
    expect(ex).toBeGreaterThan(0);
  });

  it("uses a token already cached in Redis without calling the OAuth endpoint", async () => {
    mockRedisGet.mockResolvedValue("APP_USR-from-redis");

    const token = await getMeliAccessToken();

    expect(token).toBe("APP_USR-from-redis");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("still obtains a token when Redis is unavailable", async () => {
    mockRedisGet.mockRejectedValue(new Error("redis down"));
    mockRedisSet.mockRejectedValue(new Error("redis down"));
    mockPost.mockResolvedValue(tokenResponse());

    await expect(getMeliAccessToken()).resolves.toBe("APP_USR-token-abc");
  });
});

describe("getMeliAccessToken — concurrency", () => {
  it("issues a single request when many callers ask at the same time", async () => {
    mockPost.mockImplementation(
      async () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(tokenResponse()), 20),
        ),
    );

    const tokens = await Promise.all([
      getMeliAccessToken(),
      getMeliAccessToken(),
      getMeliAccessToken(),
      getMeliAccessToken(),
    ]);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(new Set(tokens).size).toBe(1);
  });

  it("recovers after a failed refresh instead of caching the rejection", async () => {
    mockPost.mockRejectedValueOnce(new Error("temporary failure"));
    await expect(getMeliAccessToken()).rejects.toThrow();

    mockPost.mockResolvedValueOnce(tokenResponse());
    await expect(getMeliAccessToken()).resolves.toBe("APP_USR-token-abc");
  });
});

describe("invalidateMeliToken", () => {
  it("forces the next call to obtain a fresh token", async () => {
    mockPost.mockResolvedValue(tokenResponse());
    await getMeliAccessToken();

    invalidateMeliToken();
    await getMeliAccessToken();

    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("drops the Redis copy so other instances stop reusing it", async () => {
    mockPost.mockResolvedValue(tokenResponse());
    await getMeliAccessToken();

    invalidateMeliToken();

    expect(mockRedisDel).toHaveBeenCalledWith(MELI_TOKEN_CACHE_KEY);
  });
});
