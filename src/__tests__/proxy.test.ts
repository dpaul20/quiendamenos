jest.mock("next/server", () => {
  const MockNextResponse = {
    json: jest.fn((body: unknown, init?: { status?: number }) => {
      const resp = {
        status: init?.status ?? 200,
        body,
        headers: new Map<string, string>(),
        setHeader(key: string, value: string) {
          this.headers.set(key, value);
        },
      };
      return resp;
    }),
    next: jest.fn(() => {
      const resp = {
        status: 200,
        headers: new Map<string, string>(),
        setHeader(key: string, value: string) {
          this.headers.set(key, value);
        },
      };
      return resp;
    }),
  };
  return { NextResponse: MockNextResponse, NextRequest: jest.fn() };
});

function makeRequest(apiKey?: string, ip?: string, forwardedFor?: string) {
  const headerMap = new Map<string, string>();
  if (apiKey !== undefined) headerMap.set("x-api-key", apiKey);
  if (forwardedFor !== undefined)
    headerMap.set("x-forwarded-for", forwardedFor);

  return {
    headers: {
      get: (key: string) => headerMap.get(key.toLowerCase()) ?? null,
    },
    ip: ip ?? null,
  };
}

describe("middleware", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      API_SECRET_KEY: "test-key",
    };
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  async function loadMiddleware() {
    const mod = await import("@/proxy");
    return mod.middleware;
  }

  it("returns 401 when X-API-Key header is missing", async () => {
    const middleware = await loadMiddleware();
    const req = makeRequest(undefined);
    const res = await middleware(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 401 when X-API-Key is wrong", async () => {
    const middleware = await loadMiddleware();
    const req = makeRequest("wrong-key");
    const res = await middleware(req as never);
    expect(res.status).toBe(401);
  });

  it("proceeds (calls next) when X-API-Key is correct", async () => {
    const middleware = await loadMiddleware();
    const req = makeRequest("test-key", "1.2.3.4");
    const res = await middleware(req as never);
    expect(res.status).toBe(200);
  });

  it("allows 10 requests from same IP", async () => {
    const middleware = await loadMiddleware();
    const results = [];
    for (let i = 0; i < 10; i++) {
      const req = makeRequest("test-key", undefined, "5.5.5.5");
      results.push(await middleware(req as never));
    }
    const statuses = results.map((r) => r.status);
    expect(statuses.every((s) => s === 200)).toBe(true);
  });

  it("returns 429 on 11th request from same IP within window", async () => {
    const middleware = await loadMiddleware();
    for (let i = 0; i < 10; i++) {
      const req = makeRequest("test-key", undefined, "6.6.6.6");
      await middleware(req as never);
    }
    const req = makeRequest("test-key", undefined, "6.6.6.6");
    const res = await middleware(req as never);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("adds X-Frame-Options: DENY to passing responses", async () => {
    const middleware = await loadMiddleware();
    const req = makeRequest("test-key", "7.7.7.7");
    const res = await middleware(req as never);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("adds X-Content-Type-Options: nosniff to passing responses", async () => {
    const middleware = await loadMiddleware();
    const req = makeRequest("test-key", "8.8.8.8");
    const res = await middleware(req as never);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
