import { scrapeFravega } from "@/scrapers/fravega";

jest.mock("@/platform/http", () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

import { httpClient } from "@/platform/http";

const mockGet = httpClient.get as jest.Mock;

const API_KEY = "10c72dd259391bcada437333574ed519";

/** Reproduce the axios error shape that leaked the key into production logs. */
const timeoutErrorCarryingTheKey = () => {
  const error = new Error("timeout of 23000ms exceeded") as Error & {
    code: string;
    config: { url: string; method: string };
  };
  error.name = "AxiosError";
  error.code = "ECONNABORTED";
  error.config = {
    url: `https://api.scraperapi.com?api_key=${API_KEY}&url=https%3A%2F%2Fwww.fravega.com%2Fl%2F%3Fkeyword%3Dtv`,
    method: "get",
  };
  return error;
};

describe("scrapeFravega — error logging", () => {
  const originalEnv = process.env;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SCRAPER_API_KEY: API_KEY };
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    errorSpy.mockRestore();
  });

  it("never writes the ScraperAPI key to the log when the request fails", async () => {
    mockGet.mockRejectedValue(timeoutErrorCarryingTheKey());

    await expect(scrapeFravega("tv")).rejects.toThrow();

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain(API_KEY);
  });

  it("still logs enough to diagnose the failure", async () => {
    mockGet.mockRejectedValue(timeoutErrorCarryingTheKey());

    await expect(scrapeFravega("tv")).rejects.toThrow();

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).toContain("Fravega");
    expect(logged).toContain("timeout of 23000ms exceeded");
    expect(logged).toContain("ECONNABORTED");
  });

  it("rethrows so backoff and the per-store cache fallback can react", async () => {
    mockGet.mockRejectedValue(timeoutErrorCarryingTheKey());

    await expect(scrapeFravega("tv")).rejects.toThrow(
      "timeout of 23000ms exceeded",
    );
  });
});

describe("scrapeFravega — direct first, proxy as fallback", () => {
  const originalEnv = process.env;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  const DIRECT_URL = "https://www.fravega.com/l/?keyword=samsung%2065";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SCRAPER_API_KEY: API_KEY };
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("hits Fravega directly first, without the proxy", async () => {
    mockGet.mockResolvedValue({ data: "<html></html>" });

    await scrapeFravega("samsung 65");

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(DIRECT_URL, expect.any(Object));
  });

  it("never calls the proxy when the direct request succeeds", async () => {
    mockGet.mockResolvedValue({ data: "<html></html>" });

    await scrapeFravega("samsung 65");

    const urls = mockGet.mock.calls.map((call) => call[0] as string);
    expect(urls.some((url) => url.includes("scraperapi"))).toBe(false);
  });

  it("falls back to the proxy when the direct request fails", async () => {
    mockGet
      .mockRejectedValueOnce(new Error("Request failed with status code 403"))
      .mockResolvedValueOnce({ data: "<html></html>" });

    await scrapeFravega("samsung 65");

    expect(mockGet).toHaveBeenCalledTimes(2);
    const proxyUrl = mockGet.mock.calls[1][0] as string;
    expect(proxyUrl).toContain("api.scraperapi.com");
    expect(proxyUrl).toContain(encodeURIComponent(DIRECT_URL));
  });

  it("does not leak the key when logging the direct failure", async () => {
    mockGet
      .mockRejectedValueOnce(new Error("Request failed with status code 403"))
      .mockResolvedValueOnce({ data: "<html></html>" });

    await scrapeFravega("samsung 65");

    const logged = warnSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain(API_KEY);
  });

  it("rethrows the direct failure when no proxy key is configured", async () => {
    process.env = { ...originalEnv };
    delete process.env.SCRAPER_API_KEY;
    mockGet.mockRejectedValue(new Error("Request failed with status code 403"));

    await expect(scrapeFravega("samsung 65")).rejects.toThrow(
      "Request failed with status code 403",
    );
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("rethrows when both the direct request and the proxy fail", async () => {
    mockGet
      .mockRejectedValueOnce(new Error("direct 403"))
      .mockRejectedValueOnce(new Error("proxy timeout"));

    await expect(scrapeFravega("samsung 65")).rejects.toThrow("proxy timeout");
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});

describe("scrapeFravega — failure vs. no results", () => {
  const originalEnv = process.env;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SCRAPER_API_KEY: API_KEY };
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    errorSpy.mockRestore();
  });

  it("returns [] without throwing when the store legitimately has no matches", async () => {
    mockGet.mockResolvedValue({ data: "<html><body></body></html>" });

    await expect(scrapeFravega("producto inexistente")).resolves.toEqual([]);
  });

  it("does not log an error for a legitimately empty result", async () => {
    mockGet.mockResolvedValue({ data: "<html><body></body></html>" });

    await scrapeFravega("producto inexistente");

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
