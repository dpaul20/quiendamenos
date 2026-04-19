import { cacheKey } from "../index";

describe("cacheKey", () => {
  describe("query", () => {
    it("returns key matching q:<64 hex chars>", () => {
      expect(cacheKey.query("tv")).toMatch(/^q:[a-f0-9]{64}$/);
    });

    it("normalizes before hashing — same key for different casing/spacing", () => {
      expect(cacheKey.query("  TV Samsung  ")).toBe(cacheKey.query("tv samsung"));
    });

    it("different queries produce different keys", () => {
      expect(cacheKey.query("tv samsung")).not.toBe(cacheKey.query("notebook lenovo"));
    });

    it("100-char query produces fixed-length key (q: + 64 hex)", () => {
      const long = "a".repeat(100);
      const result = cacheKey.query(long);
      expect(result).toHaveLength(66); // "q:" + 64
    });
  });

  describe("store", () => {
    it("returns key matching s:<store>:<64 hex chars>", () => {
      expect(cacheKey.store("carrefour", "tv")).toMatch(/^s:carrefour:[a-f0-9]{64}$/);
    });

    it("same query normalization applies to store keys", () => {
      expect(cacheKey.store("naldo", "  TV  ")).toBe(cacheKey.store("naldo", "tv"));
    });
  });
});
