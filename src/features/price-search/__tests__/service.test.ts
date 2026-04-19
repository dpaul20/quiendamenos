import { scrapeWebsite } from "../service";

jest.mock("@/scrapers", () => ({
  scrapers: {
    carrefour: jest.fn(),
    fravega: jest.fn(),
  },
}));

jest.mock("@/scrapers/registry", () => ({
  getAllStores: jest.fn(() => []),
}));

jest.mock("../router", () => ({
  scrapeWithFallback: jest.fn(),
}));

jest.mock("@/platform/cache", () => ({
  cacheKey: { store: jest.fn((s, q) => `s:${s}:${q}`) },
  setStoreCacheNX: jest.fn().mockResolvedValue(undefined),
}));

import { scrapeWithFallback } from "../router";
import { setStoreCacheNX } from "@/platform/cache";

const mockScrape = scrapeWithFallback as jest.Mock;
const mockCacheNX = setStoreCacheNX as jest.Mock;

const product = { name: "TV", price: 100, brand: "Samsung", from: "carrefour", image: "", url: "", installment: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  mockCacheNX.mockResolvedValue(undefined);
});

describe("scrapeWebsite", () => {
  it("returns aggregated products from all scrapers", async () => {
    mockScrape.mockResolvedValue([product]);
    const result = await scrapeWebsite("tv");
    expect(result).toHaveLength(2); // carrefour + fravega
  });

  it("excludes results from rejected scrapers", async () => {
    mockScrape
      .mockResolvedValueOnce([product])
      .mockRejectedValueOnce(new Error("scraper failed"));
    const result = await scrapeWebsite("tv");
    expect(result).toHaveLength(1);
  });

  it("returns empty array when all scrapers return empty", async () => {
    mockScrape.mockResolvedValue([]);
    const result = await scrapeWebsite("tv");
    expect(result).toEqual([]);
  });

  it("calls setStoreCacheNX only for scrapers with results", async () => {
    mockScrape
      .mockResolvedValueOnce([product])
      .mockResolvedValueOnce([]);
    await scrapeWebsite("tv");
    const calls = mockCacheNX.mock.calls[0][0] as Array<{ key: string }>;
    expect(calls).toHaveLength(1);
  });
});
