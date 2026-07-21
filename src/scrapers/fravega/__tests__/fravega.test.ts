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

    await scrapeFravega("tv");

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain(API_KEY);
  });

  it("still logs enough to diagnose the failure", async () => {
    mockGet.mockRejectedValue(timeoutErrorCarryingTheKey());

    await scrapeFravega("tv");

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).toContain("Fravega");
    expect(logged).toContain("timeout of 23000ms exceeded");
    expect(logged).toContain("ECONNABORTED");
  });

  it("returns an empty array so the per-store fallback still applies", async () => {
    mockGet.mockRejectedValue(timeoutErrorCarryingTheKey());

    await expect(scrapeFravega("tv")).resolves.toEqual([]);
  });
});
