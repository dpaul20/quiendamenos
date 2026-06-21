import { fetchPriceHistory } from "../history";

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("fetchPriceHistory", () => {
  it("calls /api/prices/history?query=... with the encoded query", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    await fetchPriceHistory("iphone 15");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/prices/history?query=iphone%2015",
    );
  });

  it("returns PriceHistoryEntry[] sorted ASC (reverses DESC API response)", async () => {
    const descEntries = [
      { date: "2026-06-21", minPrice: 300000 },
      { date: "2026-06-20", minPrice: 290000 },
      { date: "2026-06-19", minPrice: 280000 },
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => descEntries,
    });

    const result = await fetchPriceHistory("iphone");
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe("2026-06-19");
    expect(result[1].date).toBe("2026-06-20");
    expect(result[2].date).toBe("2026-06-21");
  });

  it("returns [] if fetch throws (network error)", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await fetchPriceHistory("iphone");
    expect(result).toEqual([]);
  });

  it("returns [] if response is not OK", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const result = await fetchPriceHistory("iphone");
    expect(result).toEqual([]);
  });

  it("returns [] if response is an empty array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const result = await fetchPriceHistory("iphone");
    expect(result).toEqual([]);
  });
});
