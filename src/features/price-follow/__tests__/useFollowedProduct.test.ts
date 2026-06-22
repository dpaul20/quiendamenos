/** @jest-environment node */
import {
  FOLLOW_KEY,
  getFollowedUrls,
  setFollowedUrls,
  computeToggle,
} from "../useFollowedProduct";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

describe("getFollowedUrls", () => {
  it("returns empty array when key is absent", () => {
    expect(getFollowedUrls(mockStorage)).toEqual([]);
  });

  it("returns parsed array when key exists", () => {
    mockStorage[FOLLOW_KEY] = JSON.stringify(["http://a.com", "http://b.com"]);
    expect(getFollowedUrls(mockStorage)).toEqual([
      "http://a.com",
      "http://b.com",
    ]);
  });

  it("returns empty array on malformed JSON", () => {
    mockStorage[FOLLOW_KEY] = "not-valid-json";
    expect(getFollowedUrls(mockStorage)).toEqual([]);
  });
});

describe("setFollowedUrls", () => {
  it("serializes and writes the array", () => {
    setFollowedUrls(mockStorage, ["http://x.com"]);
    expect(mockStorage[FOLLOW_KEY]).toBe(JSON.stringify(["http://x.com"]));
  });

  it("overwrites previous value", () => {
    mockStorage[FOLLOW_KEY] = JSON.stringify(["http://old.com"]);
    setFollowedUrls(mockStorage, ["http://new.com"]);
    expect(mockStorage[FOLLOW_KEY]).toBe(JSON.stringify(["http://new.com"]));
  });
});

describe("computeToggle", () => {
  it("adds URL when not present", () => {
    expect(computeToggle([], "http://a.com")).toEqual(["http://a.com"]);
  });

  it("removes URL when already present", () => {
    expect(computeToggle(["http://a.com"], "http://a.com")).toEqual([]);
  });

  it("preserves other URLs when removing one", () => {
    const result = computeToggle(
      ["http://a.com", "http://b.com"],
      "http://a.com",
    );
    expect(result).toEqual(["http://b.com"]);
  });

  it("adds without affecting other URLs", () => {
    const result = computeToggle(["http://a.com"], "http://b.com");
    expect(result).toEqual(["http://a.com", "http://b.com"]);
  });
});

describe("full toggle flow (read → compute → write)", () => {
  const URL = "http://product.com/p1";

  it("follow: URL is absent → gets added to storage", () => {
    const before = getFollowedUrls(mockStorage);
    const next = computeToggle(before, URL);
    setFollowedUrls(mockStorage, next);

    expect(getFollowedUrls(mockStorage)).toContain(URL);
  });

  it("unfollow: URL is present → gets removed from storage", () => {
    setFollowedUrls(mockStorage, [URL]);

    const before = getFollowedUrls(mockStorage);
    const next = computeToggle(before, URL);
    setFollowedUrls(mockStorage, next);

    expect(getFollowedUrls(mockStorage)).not.toContain(URL);
    expect(getFollowedUrls(mockStorage)).toHaveLength(0);
  });

  it("double-toggle restores original state", () => {
    const after1 = computeToggle(getFollowedUrls(mockStorage), URL);
    setFollowedUrls(mockStorage, after1);
    expect(getFollowedUrls(mockStorage)).toContain(URL);

    const after2 = computeToggle(getFollowedUrls(mockStorage), URL);
    setFollowedUrls(mockStorage, after2);
    expect(getFollowedUrls(mockStorage)).not.toContain(URL);
  });

  it("multiple products can be followed independently", () => {
    const URL2 = "http://product.com/p2";

    setFollowedUrls(
      mockStorage,
      computeToggle(getFollowedUrls(mockStorage), URL),
    );
    setFollowedUrls(
      mockStorage,
      computeToggle(getFollowedUrls(mockStorage), URL2),
    );

    const followed = getFollowedUrls(mockStorage);
    expect(followed).toContain(URL);
    expect(followed).toContain(URL2);
    expect(followed).toHaveLength(2);
  });
});
