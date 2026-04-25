import { fetchTrendMap } from "../trend";

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("fetchTrendMap", () => {
  it("retorna direction=down cuando precio bajó", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { date: "2026-04-25", minPrice: 90000 },
        { date: "2026-04-24", minPrice: 100000 },
      ],
    });

    const result = await fetchTrendMap("iphone");
    expect(result["__global__"]).toEqual({ direction: "down", delta: 10 });
  });

  it("retorna direction=up cuando precio subió", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { date: "2026-04-25", minPrice: 110000 },
        { date: "2026-04-24", minPrice: 100000 },
      ],
    });

    const result = await fetchTrendMap("iphone");
    expect(result["__global__"]).toEqual({ direction: "up", delta: 10 });
  });

  it("retorna {} cuando fetch falla", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));
    const result = await fetchTrendMap("iphone");
    expect(result).toEqual({});
  });

  it("retorna {} cuando delta < 1%", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { date: "2026-04-25", minPrice: 100000 },
        { date: "2026-04-24", minPrice: 100000 },
      ],
    });

    const result = await fetchTrendMap("iphone");
    expect(result).toEqual({});
  });

  it("retorna {} con menos de 2 entries", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ date: "2026-04-25", minPrice: 100000 }],
    });

    const result = await fetchTrendMap("iphone");
    expect(result).toEqual({});
  });
});
