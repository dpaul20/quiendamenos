/** @jest-environment node */
import { signToken, verifyToken } from "../token";

const TEST_SECRET = "test-secret-abc123";

beforeEach(() => {
  process.env.ALERT_TOKEN_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.ALERT_TOKEN_SECRET;
});

describe("signToken", () => {
  it("returns a non-empty hex string", () => {
    const token = signToken("user@example.com", "https://store.com/p/123");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns the same token for the same inputs (deterministic)", () => {
    const t1 = signToken("user@example.com", "https://store.com/p/123");
    const t2 = signToken("user@example.com", "https://store.com/p/123");
    expect(t1).toBe(t2);
  });
});

describe("verifyToken", () => {
  it("returns true for a valid round-trip token", () => {
    const email = "user@example.com";
    const url = "https://store.com/p/123";
    const token = signToken(email, url);
    expect(verifyToken(email, url, token)).toBe(true);
  });

  it("returns false when the token is tampered", () => {
    const email = "user@example.com";
    const url = "https://store.com/p/123";
    const token = signToken(email, url);
    const tampered = token.replace(/.$/, token.endsWith("a") ? "b" : "a");
    expect(verifyToken(email, url, tampered)).toBe(false);
  });

  it("returns false when email differs from what was signed", () => {
    const token = signToken("real@example.com", "https://store.com/p/123");
    expect(
      verifyToken("evil@example.com", "https://store.com/p/123", token),
    ).toBe(false);
  });

  it("returns false when url differs from what was signed", () => {
    const token = signToken("user@example.com", "https://store.com/p/123");
    expect(
      verifyToken("user@example.com", "https://store.com/p/other", token),
    ).toBe(false);
  });

  it("returns false when ALERT_TOKEN_SECRET is missing", () => {
    delete process.env.ALERT_TOKEN_SECRET;
    const token = "a".repeat(64);
    expect(
      verifyToken("user@example.com", "https://store.com/p/123", token),
    ).toBe(false);
  });
});
