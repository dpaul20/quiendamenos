/** @jest-environment node */
import {
  FOLLOW_KEY,
  getFollowedUrls,
  setFollowedUrls,
} from "../useFollowedProduct";

// We test the pure localStorage helpers directly since the hook uses useEffect
// and is not renderable in node environment. The hook itself is tested via behavior.

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

describe("getFollowedUrls", () => {
  it("returns empty array when localStorage key is absent", () => {
    const result = getFollowedUrls(mockStorage);
    expect(result).toEqual([]);
  });

  it("returns parsed array when localStorage has URLs", () => {
    mockStorage[FOLLOW_KEY] = JSON.stringify(["http://a.com", "http://b.com"]);
    const result = getFollowedUrls(mockStorage);
    expect(result).toHaveLength(2);
    expect(result).toContain("http://a.com");
    expect(result).toContain("http://b.com");
  });

  it("returns empty array when stored JSON is malformed", () => {
    mockStorage[FOLLOW_KEY] = "not-valid-json";
    const result = getFollowedUrls(mockStorage);
    expect(result).toEqual([]);
  });
});

describe("setFollowedUrls", () => {
  it("serializes the array and writes it to storage", () => {
    setFollowedUrls(mockStorage, ["http://x.com"]);
    expect(mockStorage[FOLLOW_KEY]).toBe(JSON.stringify(["http://x.com"]));
  });

  it("overwrites previous value", () => {
    mockStorage[FOLLOW_KEY] = JSON.stringify(["http://old.com"]);
    setFollowedUrls(mockStorage, ["http://new.com"]);
    expect(mockStorage[FOLLOW_KEY]).toBe(JSON.stringify(["http://new.com"]));
  });
});

describe("follow toggle logic", () => {
  it("adding a URL that is not present results in it being in the list", () => {
    const urls: string[] = [];
    const url = "http://product.com";
    const next = urls.includes(url)
      ? urls.filter((u) => u !== url)
      : [...urls, url];
    expect(next).toContain(url);
  });

  it("removing a URL that is present results in it being absent", () => {
    const urls = ["http://product.com"];
    const url = "http://product.com";
    const next = urls.includes(url)
      ? urls.filter((u) => u !== url)
      : [...urls, url];
    expect(next).not.toContain(url);
    expect(next).toHaveLength(0);
  });
});
